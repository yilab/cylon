Cylon = require '..'

Cylon.api host: '0.0.0.0', port: '8080'

bots = [
  { port: '/dev/rfcomm0', name: 'Thelma' },
  { port: '/dev/rfcomm1', name: 'Louise' }
]

SpheroRobot =
  connection:
    name: 'Sphero', adaptor: 'sphero'

  device:
    name: 'sphero', driver: 'sphero'

  work: (me) ->
    every 1.seconds(), ->
      Logger.info me.name
      me.sphero.setRGB Math.floor(Math.random() * 100000)
      me.sphero.roll 60, Math.floor(Math.random() * 360)

for bot in bots
  robot = Object.create(SpheroRobot)
  robot.connection.port = bot.port
  robot.name = bot.name
  Cylon.robot robot

Cylon.start()
