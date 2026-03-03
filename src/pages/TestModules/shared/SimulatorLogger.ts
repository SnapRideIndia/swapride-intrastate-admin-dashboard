/**
 * SimulatorLogger
 *
 * Specialized logging utility for Test Modules to provide both
 * "Humanized" manager-level instruction and "Technical" API-level depth.
 */
import { Log } from "../types";

type LogType = Log["type"];

export class SimulatorLogger {
  private addLogFn: (msg: string, type: LogType) => void;

  constructor(addLogFn: (msg: string, type: LogType) => void) {
    this.addLogFn = addLogFn;
  }

  /**
   * Humanized Manager instructions/status
   */
  admin(message: string) {
    this.addLogFn(message, "info");
  }

  /**
   * Technical API Request details
   */
  apiRequest(method: string, url: string) {
    // Remove base URL if present for cleaner logs
    const shortUrl = url.replace(/^https?:\/\/[^\/]+/, "");
    this.addLogFn(`API CALL: ${method.toUpperCase()} ${shortUrl}`, "request");
  }

  /**
   * Technical API Response success
   */
  apiResponse(status: number, message: string = "Success") {
    this.addLogFn(`API RESP [${status}]: ${message}`, "response");
  }

  /**
   * Technical API Error details
   */
  apiError(status: number | string, message: string) {
    this.addLogFn(`API ERR [${status}]: ${message}`, "error");
  }

  /**
   * General success indicators
   */
  success(message: string) {
    this.addLogFn(message, "success");
  }

  /**
   * General info/step markers
   */
  info(message: string) {
    this.addLogFn(message, "info");
  }

  /**
   * Critical error/failure markers
   */
  error(message: string) {
    this.addLogFn(message, "error");
  }
}

/**
 * Global reference for API interceptors to use
 */
let globalSimulatorLogger: SimulatorLogger | null = null;

export const setGlobalSimulatorLogger = (logger: SimulatorLogger | null) => {
  globalSimulatorLogger = logger;
};

export const getGlobalSimulatorLogger = () => globalSimulatorLogger;
