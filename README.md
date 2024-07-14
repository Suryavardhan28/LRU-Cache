# LRU Cache - Temporary Cache Storage

An LRU (Least Recently Used) cache is a type of cache that removes the least recently accessed items first when it reaches its capacity. It is designed to manage a limited amount of data by keeping the most frequently accessed items readily available and discarding the least accessed ones. This is particularly useful in scenarios where memory is limited and you need to ensure that the most relevant data is quickly accessible.

## Table of Contents

-   [Project Overview](#project-overview)
-   [Getting Started](#getting-started)
-   [Installation](#installation)
-   [Project Structure](#project-structure)
-   [Backend Setup](#backend-setup)
-   [Frontend Setup](#frontend-setup)
-   [Available Scripts](#available-scripts)
-   [Learn More](#learn-more)

## Project Overview

This project is a web application for managing a Least Recently Used (LRU) cache. It includes a React frontend and a Go backend. The frontend allows users to interact with the cache by adding, retrieving, and deleting items, while the backend handles the cache logic and storage.

Live Cache State will be displayed on the frontend.

The cache will store Key / Value with expiration. The item will be automatically removed from the cache when the expiration time is up.

### Actions that can be performed from the frontend

-   Add Key / Value with Expiration
-   Get Item using Key and Copy Value to Clipboard
-   Delete Item using Key

### Websocket connection

WebSocket is a communication protocol that provides full-duplex communication channels over a single TCP connection. It is designed to be implemented in web browsers and web servers but can be used by any client or server application. WebSockets are particularly useful for applications that require real-time updates, such as chat applications, live sports scores, or collaborative editing.

In this project, the WebSocket connection is established in the frontend to communicate with the backend server. This allows the frontend to receive real-time updates about the cache state.

### Concurrency

The LRU cache implementation in this project is concurrent in nature. It uses a `sync.Mutex` to ensure that only one goroutine can access the cache's critical sections at a time, making it safe for concurrent use. The `sync.Mutex` is used to lock and unlock the cache during operations like `Set`, `Get`, and `Delete`, ensuring thread safety.

## Getting Started

To get started with this project, you need to set up both the backend and the frontend.

### Prerequisites

-   Node.js (v14 or higher)
-   npm (v6 or higher)
-   Go (v1.22.0 or higher)

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/Suryavardhan28/LRU-Cache.git
    ```

## Project Structure

### Backend

-   `server/main.go`: Entry point for the Go server.
-   `server/internal/logger`: Logger setup for the server.
-   `server/internal/routes`: Route definitions for the server.

### Frontend

-   `client/src/index.tsx`: Entry point for the React application.
-   `client/src/App.tsx`: Main App component.
-   `client/src/components`: Contains all React components.
-   `client/src/redux`: Redux store and slices.
-   `client/src/theme`: MUI theme configuration.

## Backend Setup

1. Navigate to the `server` directory:

    ```sh
    cd server
    ```

2. Install dependencies:

    ```sh
    go mod tidy
    ```

3. Create a `.env` file in the `server` directory and add the following environment variables:
   
   **Note** : Default environment variables are provided below and is present in the repository. You can change the values based on your needs.

    - The `LRU_CACHE_SIZE` is the maximum number of items that the LRU cache can hold. Define the size of the cache based on your needs.
    - The `PORT` is the port number that the server will listen on.
    - The `ALLOWED_ORIGIN` is the origin that the server will accept requests from.

    ```env
    LRU_CACHE_SIZE=100
    PORT=8080
    ALLOWED_ORIGIN=http://localhost:3000
    ```

5. Run the server:
    ```sh
    go run main.go
    ```

## Frontend Setup

1. Navigate to the `client` directory:

    ```sh
    cd client
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm start
    ```

## Available Scripts

### Backend

In the `server` directory, you can run:

-   `go run main.go`: Starts the Go server.

### Frontend

In the `client` directory, you can run:

-   `npm start`: Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
-   `npm test`: Launches the test runner in interactive watch mode.
-   `npm run build`: Builds the app for production to the `build` folder.
-   `npm run eject`: Ejects the Create React App configuration.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

For more information on Go, visit the [Go documentation](https://golang.org/doc/).
