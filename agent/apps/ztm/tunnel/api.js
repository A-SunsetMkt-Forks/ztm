export default function ({ app, mesh }) {
  var currentListens = []
  var currentOutbound = {}

  app.onExit(() => {
    currentListens.forEach(l => {
      var protocol = l.protocol
      var ip = l.ip
      var port = l.port
      pipy.listen(`${ip}:${port}`, protocol, null)
    })
    currentListens = []
  })

  function getListenStatus(protocol, listen) {
    var ip = listen.ip
    var port = listen.port
    var l = currentListens.find(l => (l.protocol === protocol && l.ip === ip && l.port === port))
    if (l) return { ip, port, open: l.open, error: l.error }
    return { ip, port, open: false }
  }

  function checkResponse(res, f) {
    var status = res?.head?.status
    if (200 <= status && status <= 299) {
      return typeof f === 'function' ? f(res.body) : f
    }
    throw res?.head?.statusText || 'No response from peer'
  }

  function getConfig(ep) {
    if (ep === app.endpoint.id) {
      return getLocalConfig()
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'GET',
          path: `/api/config`,
        }
      )).then(res => checkResponse(res, body => JSON.decode(body)))
    }
  }

  function allTunnels(ep) {
    var inboundPattern = new http.Match(getInboundPathname('{username}', '{protocol}', '{name}', '{ep}'))
    var outboundPattern = new http.Match(getOutboundPathname('{username}', '{protocol}', '{name}', '{ep}'))
    return mesh.list('/shared').then(
      files => {
        var tcp = {}
        var udp = {}
        var tunnels = { tcp, udp }
        var endpoints = {}
        Object.keys(files).forEach(filename => {
          var params = inboundPattern(filename) || outboundPattern(filename)
          if (params) {
            var tunnel = (tunnels[params.protocol][params.name] ??= {
              protocol: params.protocol,
              name: params.name,
              inbound: [],
              outbound: [],
            })
            var ep = (endpoints[params.ep] ??= { id: params.ep })
            if (filename.endsWith('/inbound.json')) tunnel.inbound.push(ep)
            if (filename.endsWith('/outbound.json')) tunnel.outbound.push(ep)
          }
        })
        return mesh.discover(Object.keys(endpoints)).then(
          list => {
            list.filter(ep => ep).forEach(ep => Object.assign(endpoints[ep.id], ep))
            return [
              ...Object.values(tcp),
              ...Object.values(udp),
            ]
          }
        )
      }
    )
  }

  function allInbound(ep) {
    if (ep === app.endpoint.id) {
      return getLocalConfig().then(
        config => config.inbound.map(i => ({
          ...i, listens: i.listens.map(l => getListenStatus(i.protocol, l))
        }))
      )
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'GET',
          path: `/api/inbound`,
        }
      )).then(res => checkResponse(res, body => JSON.decode(body)))
    }
  }

  function allOutbound(ep) {
    if (ep === app.endpoint.id) {
      return getLocalConfig().then(
        config => config.outbound
      )
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'GET',
          path: `/api/outbound`,
        }
      )).then(res => checkResponse(res, body => JSON.decode(body)))
    }
  }

  function getTunnel(protocol, name) {
    var inboundPattern = new http.Match(getInboundPathname('{username}', protocol, name, '{ep}'))
    var outboundPattern = new http.Match(getOutboundPathname('{username}', protocol, name, '{ep}'))
    return mesh.list('/shared').then(
      files => {
        var inbound = []
        var outbound = []
        var endpoints = {}
        Object.keys(files).forEach(filename => {
          var params = inboundPattern(filename) || outboundPattern(filename)
          if (params) {
            var ep = (endpoints[params.ep] ??= { id: params.ep })
            if (filename.endsWith('/inbound.json')) inbound.push(ep)
            if (filename.endsWith('/outbound.json')) outbound.push(ep)
          }
        })
        return mesh.discover(Object.keys(endpoints)).then(
          list => {
            list.filter(ep => ep).forEach(ep => Object.assign(endpoints[ep.id], ep))
            return {
              protocol,
              name,
              inbound,
              outbound,
            }
          }
        )
      }
    )
  }

  function getInbound(ep, protocol, name) {
    if (ep === app.endpoint.id) {
      return getLocalConfig().then(
        config => config.inbound.find(
          i => i.protocol === protocol && i.name === name
        )
      ).then(i => {
        if (!i) return null
        return { ...i, listens: i.listens.map(l => getListenStatus(i.protocol, l)) }
      })
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'GET',
          path: `/api/inbound/${protocol}/${URL.encodeComponent(name)}`,
        }
      )).then(res => checkResponse(res, body => JSON.decode(body)))
    }
  }

  function getOutbound(ep, protocol, name) {
    if (ep === app.endpoint.id) {
      return getLocalConfig().then(
        config => config.outbound.find(
          o => o.protocol === protocol && o.name === name
        ) || null
      )
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'GET',
          path: `/api/outbound/${protocol}/${URL.encodeComponent(name)}`,
        }
      )).then(res => checkResponse(res, body => JSON.decode(body)))
    }
  }

  function setInbound(ep, protocol, name, listens, exits) {
    if (ep === app.endpoint.id) {
      exits = exits || []
      checkProtocol(protocol)
      checkName(name)
      checkListens(listens)
      checkExits(exits)
      return getLocalConfig().then(config => {
        var all = config.inbound
        var ent = { protocol, name, listens, exits }
        var i = all.findIndex(i => i.protocol === protocol && i.name === name)
        if (i >= 0) {
          all[i] = ent
        } else {
          all.push(ent)
        }
        setLocalConfig(config)
        applyLocalConfig(config)
        mesh.write(getInboundPathname(app.username, protocol, name, ep), JSON.encode({
          name: app.endpoint.name,
          exits,
        }))
      })
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'POST',
          path: `/api/inbound/${protocol}/${URL.encodeComponent(name)}`,
        },
        JSON.encode({ listens, exits })
      )).then(checkResponse)
    }
  }

  function setOutbound(ep, protocol, name, targets, entrances, users) {
    if (ep === app.endpoint.id) {
      entrances = entrances || []
      users = users || []
      checkProtocol(protocol)
      checkName(name)
      checkTargets(targets)
      checkEntrances(entrances)
      checkUsers(users)
      return getLocalConfig().then(config => {
        var all = config.outbound
        var ent = { protocol, name, targets, entrances, users }
        var i = all.findIndex(o => o.protocol === protocol && o.name === name)
        if (i >= 0) {
          all[i] = ent
        } else {
          all.push(ent)
        }
        setLocalConfig(config)
        applyLocalConfig(config)
        mesh.write(getOutboundPathname(app.username, protocol, name, ep), JSON.encode({
          name: app.endpoint.name,
          entrances,
          users,
        }))
      })
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'POST',
          path: `/api/outbound/${protocol}/${URL.encodeComponent(name)}`,
        },
        JSON.encode({ targets, entrances })
      )).then(checkResponse)
    }
  }

  function deleteInbound(ep, protocol, name) {
    if (ep === app.endpoint.id) {
      return getLocalConfig().then(config => {
        var all = config.inbound
        var i = all.findIndex(i => i.protocol === protocol && i.name === name)
        if (i >= 0) {
          all.splice(i, 1)
          setLocalConfig(config)
          applyLocalConfig(config)
          mesh.erase(getInboundPathname(app.username, protocol, name, ep))
        }
      })
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'DELETE',
          path: `/api/inbound/${protocol}/${URL.encodeComponent(name)}`,
        }
      )).then(checkResponse)
    }
  }

  function deleteOutbound(ep, protocol, name) {
    if (ep === app.endpoint.id) {
      return getLocalConfig().then(config => {
        var all = config.outbound
        var i = all.findIndex(o => o.protocol === protocol && o.name === name)
        if (i >= 0) {
          all.splice(i, 1)
          setLocalConfig(config)
          applyLocalConfig(config)
          mesh.erase(getOutboundPathname(app.username, protocol, name, ep))
        }
      })
    } else {
      return mesh.request(ep, new Message(
        {
          method: 'DELETE',
          path: `/api/outbound/${protocol}/${URL.encodeComponent(name)}`,
        }
      )).then(checkResponse)
    }
  }

  function getLocalConfig() {
    return mesh.read('/local/config.json').then(
      data => data ? JSON.decode(data) : { inbound: [], outbound: [] }
    )
  }

  function setLocalConfig(config) {
    mesh.write('/local/config.json', JSON.encode(config))
  }

  function publishConfig(config) {
    var ep = app.endpoint.id
    config.inbound.forEach(i => {
      var protocol = i.protocol
      var name = i.name
      var exits = i.exits || []
      mesh.write(getInboundPathname(app.username, protocol, name, ep), JSON.encode({
        name: app.endpoint.name,
        exits,
      }))
    })
    config.outbound.forEach(o => {
      var protocol = o.protocol
      var name = o.name
      var entrances = o.entrances || []
      var users = o.users || []
      mesh.write(getOutboundPathname(app.username, protocol, name, ep), JSON.encode({
        name: app.endpoint.name,
        entrances,
        users,
      }))
    })
  }

  function applyLocalConfig(config) {
    currentListens.forEach(l => {
      var protocol = l.protocol
      var ip = l.ip
      var port = l.port
      if (!config.inbound.some(i => (
        i.protocol === protocol &&
        i.listens.some(l => l.ip === ip && l.port === port)
      ))) {
        pipy.listen(`${ip}:${port}`, protocol, null)
        app.log(`Stopped ${protocol} listening ${ip}:${port}`)
      }
    })

    currentListens = []
    currentOutbound = {}

    config.inbound.forEach(i => {
      var protocol = i.protocol
      var name = i.name
      var listens = i.listens

      var $selectedEP
      var connectPeer = pipeline($=>$
        .connectHTTPTunnel(
          new Message({
            method: 'CONNECT',
            path: `/api/outbound/${protocol}/${URL.encodeComponent(name)}`,
          })
        ).to($=>$
          .muxHTTP().to($=>$
            .pipe(() => mesh.connect($selectedEP))
          )
        )
        .onEnd(() => app.log(`Disconnected from ep ${$selectedEP} for ${protocol}/${name}`))
      )

      var pass = null
      var deny = pipeline($=>$.replaceStreamStart(new StreamEnd).replaceData())

      switch (protocol) {
        case 'tcp':
          pass = connectPeer
          break
        case 'udp':
          pass = pipeline($=>$
            .replaceData(data => new Message(data))
            .encodeWebSocket()
            .pipe(connectPeer)
            .decodeWebSocket()
            .replaceMessage(msg => msg.body)
          )
          break
      }

      var filenamePattern = new http.Match(getOutboundPathname('{username}', protocol, name, '{ep}'))

      var p = pipeline($=>$
        .onStart(() =>
          ((i.exits && i.exits.length > 0)
            ? Promise.resolve(i.exits)
            : mesh.list('/shared').then(
              files => {
                var eps = []
                Object.keys(files).forEach(path => {
                  var params = filenamePattern(path)
                  if (params) {
                    eps.push(params.ep)
                  }
                })
                return mesh.discover(eps).then(
                  endpoints => endpoints.filter(ep => ep?.online).map(ep => ep.id)
                )
              }
            )
          ).then(exits => Promise.any(
            exits.map(
              id => getOutbound(id, protocol, name).then(
                o => {
                  if (!o) throw null
                  if (!canAccess(o, app.endpoint.id, app.username)) throw null
                  return id
                }
              )
            )
          )).then(exit => {
            $selectedEP = exit
            app.log(`Connect to ep ${$selectedEP} for ${protocol}/${name}`)
            return new Data
          }).catch(() => {
            app.log(`No exit found for ${protocol}/${name}`)
            return new Data
          })
        )
        .pipe(() => $selectedEP ? pass : deny)
      )

      listens.forEach(l => {
        try {
          pipy.listen(`${l.ip}:${l.port}`, protocol, p)
          currentListens.push({ protocol, ip: l.ip, port: l.port, open: true })
          app.log(`Started ${protocol} listening ${l.ip}:${l.port}`)
        } catch (err) {
          var error = err.message || err.toString()
          currentListens.push({ protocol, ip: l.ip, port: l.port, open: false, error })
          app.log(`Cannot open port ${l.ip}:${l.port}: ${err}`)
        }
      })
    })

    config.outbound.forEach(o => {
      var key = `${o.protocol}/${o.name}`
      currentOutbound[key] = {
        entrances: o.entrances,
        users: o.users,
        balancer: new algo.LoadBalancer(o.targets),
      }
    })
  }

  var matchApiOutbound = new http.Match('/api/outbound/{proto}/{name}')
  var response200 = new Message({ status: 200 })
  var response403 = new Message({ status: 403 })
  var response404 = new Message({ status: 404 })

  var $ctx
  var $resource
  var $target
  var $protocol

  var servePeerInbound = pipeline($=>$
    .onStart(c => { $ctx = c })
    .acceptHTTPTunnel(req => {
      var params = matchApiOutbound(req.head.path)
      var proto = params?.proto
      var name = URL.decodeComponent(params?.name)
      var key = `${proto}/${name}`
      var outbound = currentOutbound[key]
      if (outbound) {
        var peer = $ctx.peer
        if (canAccess(outbound, peer.id, peer.username)) {
          $resource = outbound.balancer.allocate()
          var target = $resource.target
          var host = target.host
          var port = target.port
          $target = `${host}:${port}`
          $protocol = proto
          app.log(`Connect to ${$target} for ${key}`)
          return response200
        } else {
          app.log(`Rejected inbound from ${peer.id} (user = ${peer.username}) for ${key}`)
          return response403
        }
      }
      app.log(`No target found for ${key}`)
      return response404
    }).to($=>$
      .onStart(() => $protocol === 'tcp' ? new Data : null)
      .pipe(() => $protocol, {
        'tcp': ($=>$
          .connect(() => $target)
        ),
        'udp': ($=>$
          .decodeWebSocket()
          .replaceMessage(msg => msg.body)
          .connect(() => $target, { protocol: 'udp' })
          .replaceData(data => new Message(data))
          .encodeWebSocket()
        )
      })
      .onEnd(() => {
        $resource.free()
        app.log(`Disconnected from ${$target}`)
      })
    )
  )

  function canAccess(outbound, ep, user) {
    var entrances = outbound.entrances
    if (entrances instanceof Array && entrances.length > 0) {
      if (!entrances.includes(ep)) return false
    }

    var users = outbound.users
    if (users instanceof Array && users.length > 0) {
      if (!users.includes(user)) return false
    }

    return true
  }

  function getInboundPathname(username, protocol, name, ep) {
    return `/shared/${username}/${protocol}/${name}/${ep}/inbound.json`
  }

  function getOutboundPathname(username, protocol, name, ep) {
    return `/shared/${username}/${protocol}/${name}/${ep}/outbound.json`
  }

  getLocalConfig().then(config => {
    publishConfig(config)
    applyLocalConfig(config)
  })

  return {
    getConfig,
    allTunnels,
    allInbound,
    allOutbound,
    getTunnel,
    getInbound,
    getOutbound,
    setInbound,
    setOutbound,
    deleteInbound,
    deleteOutbound,
    servePeerInbound,
    canAccess,
  }
}

function checkProtocol(protocol) {
  switch (protocol) {
    case 'tcp':
    case 'udp':
      return
    default: throw `invalid protocol '${protocol}'`
  }
}

function checkName(name) {
  if (
    typeof name !== 'string' ||
    name.indexOf('/') >= 0
  ) throw `invalid name '${name}'`
}

function checkIP(ip) {
  try {
    new IP(ip)
  } catch {
    throw `malformed IP address '${ip}'`
  }
}

function checkHost(host) {
  if (
    typeof host !== 'string' ||
    host.indexOf(':') >= 0 ||
    host.indexOf('[') >= 0 ||
    host.indexOf(']') >= 0
  ) throw `invalid host '${host}'`
}

function checkPort(port) {
  if (
    typeof port !== 'number' ||
    port < 1 || port > 65535
  ) throw `invalid port number: ${port}`
}

function checkUUID(uuid) {
  if (
    typeof uuid !== 'string' ||
    uuid.length !== 36 ||
    uuid.charAt(8) != '-' ||
    uuid.charAt(13) != '-' ||
    uuid.charAt(18) != '-' ||
    uuid.charAt(23) != '-'
  ) throw `malformed UUID '${uuid}'`
}

function checkListens(listens) {
  if (!(listens instanceof Array)) throw 'invalid listen array'
  listens.forEach(l => {
    if (typeof l !== 'object' || l === null) throw 'invalid listen'
    checkIP(l.ip)
    checkPort(l.port)
  })
}

function checkTargets(targets) {
  if (!(targets instanceof Array)) throw 'invalid target array'
  targets.forEach(t => {
    if (typeof t !== 'object' || t === null) throw 'invalid target'
    checkHost(t.host)
    checkPort(t.port)
  })
}

function checkExits(exits) {
  if (!(exits instanceof Array)) throw 'invalid exit array'
  exits.forEach(e => checkUUID(e))
}

function checkEntrances(entrances) {
  if (!(entrances instanceof Array)) throw 'invalid entrance array'
  entrances.forEach(e => checkUUID(e))
}

function checkUsers(users) {
  if (!(users instanceof Array)) throw 'invalid user array'
  users.forEach(u => checkName(u))
}
