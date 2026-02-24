import { useEffect, useMemo } from "react";
import { connectSocket, socket } from "../utils/socketClient";

export function useSocket(handlers = {}) {
  // handlers: { welcome: fn, data_update: fn, ai_result: fn, connect: fn, disconnect: fn, ... }

  const stableHandlers = useMemo(() => handlers, [handlers]);

  useEffect(() => {
    connectSocket();

    // core events
    const onConnect = () => stableHandlers.connect?.();
    const onDisconnect = () => stableHandlers.disconnect?.();

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // custom events
    Object.entries(stableHandlers).forEach(([event, fn]) => {
      if (!fn) return;
      if (event === "connect" || event === "disconnect") return;
      socket.on(event, fn);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);

      Object.entries(stableHandlers).forEach(([event, fn]) => {
        if (!fn) return;
        if (event === "connect" || event === "disconnect") return;
        socket.off(event, fn);
      });

      // tuỳ bạn: dev thường để socket sống, nhưng nếu muốn gọn thì disconnect
      // disconnectSocket();
    };
  }, [stableHandlers]);

  return socket;
}

export default useSocket;
