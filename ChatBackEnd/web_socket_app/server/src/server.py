import asyncio
import websockets
import json

CONNECTIONS = set()

async def handler(websocket):
    # handle a new incoming websocket
    CONNECTIONS.add(websocket)
    async for message in websocket:
        # handle each message from the websocket
        message = json.loads(message)
        if message['type'] == 'msg':
            for connection in CONNECTIONS:
                await connection.send(json.dumps(message))
    # once the websocket finishes sending messages, we can remove it.
    CONNECTIONS.remove(websocket)
    await websocket.close()

async def main():
    async with websockets.serve(handler, '', 8000): # serve on port 8000
        await asyncio.Future()



if __name__ == "__main__":
    asyncio.run(main())