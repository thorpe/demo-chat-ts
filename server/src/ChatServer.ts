import * as express from 'express'
import * as socketIo from 'socket.io'
import { createServer, Server } from 'http'
import * as SocketIO from "socket.io"
import * as redis from 'redis'

const cors = require('cors')

export interface ChatMessage {
  socketId: string;
  author: string;
  message: string;
}

export enum ChatEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message'
}


export class ChatServer {
  public static readonly PORT: number = 8080
  private readonly _app: express.Application
  private readonly server: Server
  private io: SocketIO.Server
  private readonly port: string | number

  constructor() {
    this._app = express()
    this.port = ChatServer.PORT
    this._app.use(cors())
    this._app.options('*', cors())
    this.server = createServer(this._app)
    this.initSocket()
    this.initRedisSubscriber()
    this.socketListen()

    this._app.get('/', function (req, res) {
      // 레디스로 메세지를 보낸다.
      const publisher: redis.RedisClient = redis.createClient(6379, 'localhost')
      publisher.publish("user-notify", JSON.stringify(req.query))
      res.send(req.query)
    })
  }

  private initSocket(): void {
    this.io = socketIo(this.server)
  }

  // 레디스로부터 데이터를 받는다.
  private initRedisSubscriber(): void {
    const subscriber: redis.RedisClient = redis.createClient(6379, 'localhost')
    subscriber.on("message", (channel, message) => {
      const m = JSON.parse(message)
      console.log(m.socketId)
      if (m.socketId) {
        console.log('Socket1111 : [server](message): %s', JSON.stringify(m))
        this.io.to(m.socketId).emit('message', m)
      } else {
        console.log('Socket2222 : [server](message): %s', JSON.stringify(m))
        this.io.emit('message', m)
      }
    })
    subscriber.subscribe("user-notify")
  }

  // 소켓서버 리스닝
  private socketListen(): void {
    this.server.listen(this.port, () => {
      console.log('Socket : Running server on port %s', this.port)
    })

    this.io.on(ChatEvent.CONNECT, (socket: any) => {
      console.log('Socket : Connected client on port %s.', this.port)
      console.log('Socket : Connected client on port %s.', socket.id)

      socket.on(ChatEvent.MESSAGE, (m: ChatMessage) => {
        if (m.socketId) {
          console.log('Socket : [server](message): %s', JSON.stringify(m))
          this.io.to(m.socketId).emit('message', m)
        } else {
          console.log('Socket : [server](message): %s', JSON.stringify(m))
          this.io.emit('message', m)
        }

      })

      socket.on(ChatEvent.DISCONNECT, () => {
        console.log('Socket : Client disconnected')
      })
    })
  }

  get app(): express.Application {
    return this._app
  }
}
