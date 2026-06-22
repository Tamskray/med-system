let clients = [];
const HEARTBEAT_INTERVAL_MS = 25000;

const removeClient = (res) => {
  clients = clients.filter((client) => client !== res);
};

const addClient = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  clients.push(res);

  res.write(`data: ${JSON.stringify({ action: "CONNECTED", data: null })}\n\n`);

  const heartbeatTimer = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeatTimer);
      removeClient(res);
    }
  }, HEARTBEAT_INTERVAL_MS);

  req.on("close", () => {
    clearInterval(heartbeatTimer);
    removeClient(res);
  });

  req.on("aborted", () => {
    clearInterval(heartbeatTimer);
    removeClient(res);
  });

  res.on("error", () => {
    clearInterval(heartbeatTimer);
    removeClient(res);
  });
};

const broadcast = (action, data) => {
  const payload = `data: ${JSON.stringify({ action, data })}\n\n`;
  clients = clients.filter((client) => {
    try {
      client.write(payload);
      return true;
    } catch {
      return false;
    }
  });
};

export const sseService = {
  addClient,
  broadcast,
};
