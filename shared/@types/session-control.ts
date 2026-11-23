export type TSessionOperationKind = 'start' | 'stop';
export type TSessionOperationStatus = 'idle' | 'running' | 'success' | 'error';
export type TPterodactylServerState = 'offline' | 'starting' | 'running' | 'stopping';

export interface ISessionStartParams {
    startHour: number;
    duration: number;
}

export interface IGameSession {
    index: number;
    active: boolean;
    duration: number;
    start_hour: number;
    ticks: number;
}

export interface ISessionJobState {
    id: string | null;
    kind: TSessionOperationKind | null;
    status: TSessionOperationStatus;
    step: string;
    startedAt: string | null;
    finishedAt: string | null;
    error: string | null;
}

export interface ISessionControlResponse {
    session: (IGameSession & { formattedDate: string; formattedTime: string; remainingTime: string }) | null;
    whitelistEnabled: boolean | null;
    server: {
        state: TPterodactylServerState | null;
        online: boolean;
        players: number | null;
        maxPlayers: number | null;
    };
    job: ISessionJobState;
}
