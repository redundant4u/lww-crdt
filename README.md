# lww-crdt

-   Implementation of [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) using [Last Write Wins Register](<https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type#LWW-Element-Set_(Last-Write-Wins-Element-Set)>)
-   Add a socket.io feature based on the [code by jakelazaoff](https://codesandbox.io/s/crdt-pixel-art-editor-s6f9fh)
-   Alice and Bob use [Socket.IO](https://socket.io/) for real-time data communication, ensuring no data conflicts with the help of CRDTs

## Preview

<img src="https://github.com/redundant4u/lww-crdt/assets/38307839/3b0be4ad-ea3a-4106-81d2-e2e074d8f55d" width="400" alt="crdt demo" />
<br><br>
<img src="https://github.com/redundant4u/lww-crdt/assets/38307839/3d2f100b-8abe-4e43-8873-0cd3f03a1b44" width="700" alt="crdt demo2">

## Usage

### Prerequisites

-   node (tested on 18)
-   [lww-crdt-server](https://github.com/redundant4u/lww-crdt-server)

### Run

-   Create `.env` file

    ```bash
    cp env.example .env
    ```

-   Add `SOCKET_URL` in `.env`

    ```bash
    vi .env
    ```

-   Install dependencies

    ```bash
    npm i
    ```

-   Run

    ```bash
    npm run dev

    # or
    npm run build
    npm run start
    ```

-   Demo
    -   visit [http://localhost:3001/alice](http://localhost:3001/alice)
    -   visit [http://localhost:3001/bob](http://localhost:3001/bob)
