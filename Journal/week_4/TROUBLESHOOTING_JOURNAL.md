# Week 4 - Round and Database Edge Cases

## A single correct guess ends the round early

**Status: Recorded and fixed on 2026-11-17.**

The earlier implementation ended a turn after any correct guess:

```js
endTurn(io, room, `${player.name} guessed the word!`);
```

That prevented the other guessers from continuing. The fix ends the turn only after all non-drawer players have guessed:

```js
const guessers = Array.from(room.players.values()).filter((p) => p.id !== room.drawerId);
const allGuessed = guessers.length > 0 && guessers.every((p) => p.guessed);

if (allGuessed) {
    endTurn(io, room, "Everyone guessed the word!");
}
```

## Match works, but statistics/history are missing



If MongoDB is disconnected, multiplayer can run in memory but database-backed statistics and match history are skipped. Check `/api/health` and use a URI with the intended database name:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/draw9or9die
```

The current game code only persists results when the database is connected:

```js
if (isDbConnected() && ranking.length > 0 && ranking.some((p) => p.score > 0)) {
    const winner = ranking[0];
    await MatchModel.create({
        roomCode: room.code,
        rounds: room.settings.rounds,
        players: ranking.map((p) => ({
            userId: p.userId || null,
            username: p.name,
            score: p.score,
            rank: p.rank,
        })),
        winnerUserId: winner.userId || null,
    });
}
```

Rooms are also held in server memory, so a server restart clears active games.
