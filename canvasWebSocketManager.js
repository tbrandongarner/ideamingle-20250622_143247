const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    const path = `/ws/canvas/${encodeURIComponent(canvasId)}`
    const url = `${protocol}://${host}${path}`

    this.socket = new WebSocket(url)
    this.socket.addEventListener('open', this._handleOpen)
    this.socket.addEventListener('message', this._handleMessage)
    this.socket.addEventListener('error', this._handleError)
    this.socket.addEventListener('close', this._handleClose)
  }

  disconnect() {
    if (!this.socket) return
    this._clearPing()
    this.socket.removeEventListener('open', this._handleOpen)
    this.socket.removeEventListener('message', this._handleMessage)
    this.socket.removeEventListener('error', this._handleError)
    this.socket.removeEventListener('close', this._handleClose)
    this.socket.close()
    this.socket = null
    this.canvasId = null
    this.authToken = null
    this.reconnectAttempts = 0
  }

  subscribe(eventType, callback) {
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = new Set()
    }
    this.subscribers[eventType].add(callback)
  }

  unsubscribe(eventType, callback) {
    const set = this.subscribers[eventType]
    if (!set) return
    set.delete(callback)
    if (set.size === 0) {
      delete this.subscribers[eventType]
    }
  }

  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }))
    }
  }

  sendCanvasUpdate(payload) {
    this.send('canvas:update', payload)
  }

  _handleOpen() {
    this.reconnectAttempts = 0
    this._startPing()
    if (this.authToken) {
      this.send('authenticate', { token: this.authToken })
    }
    this._emit('open')
  }

  _handleMessage(event) {
    let message
    try {
      message = JSON.parse(event.data)
    } catch {
      return
    }
    if (message.type === 'pong') return
    this._emit(message.type, message.payload)
  }

  _handleError(error) {
    this._emit('error', error)
  }

  _handleClose() {
    this._clearPing()
    this._emit('close')
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.canvasId &&
      this.authToken
    ) {
      let delay = Math.min(
        this.backoffBase * 2 ** this.reconnectAttempts,
        this.maxReconnectDelay
      )
      delay = delay * (0.5 + Math.random() * 0.5)
      this.reconnectAttempts += 1
      setTimeout(() => {
        this.connect(this.canvasId, this.authToken)
      }, delay)
    }
  }

  _startPing() {
    this.pingTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }))
      }
    }, this.pingInterval)
  }

  _clearPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  _emit(eventType, data) {
    const set = this.subscribers[eventType]
    if (!set) return
    set.forEach(cb => {
      try {
        cb(data)
      } catch (e) {
        console.error('WebSocket callback error', e)
      }
    })
  }
}

export default new CanvasWebSocketManager()