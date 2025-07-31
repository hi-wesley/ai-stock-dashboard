# AI Stock Dashboard

![Screenshot](https://i.imgur.com/NwDWa9l.png)

## Project Overview

The AI Stock Dashboard is a web-based application designed to provide users with a powerful tool for stock analysis, leveraging the capabilities of AI to offer insights and answer questions about stock performance. The dashboard allows users to track multiple stock symbols, view historical price data across different time ranges, and interact with an AI-powered chat to gain deeper insights into the data.

The primary goal of this project is to create a responsive, user-friendly interface for visualizing stock data and to integrate an AI assistant that can provide contextual analysis and answer user queries in natural language.

## Key Features

*   **Real-time Stock Tracking**: Add and remove stock symbols to a dynamic dashboard.
*   **Historical Price Charts**: Visualize historical stock prices with interactive charts.
*   **Customizable Time Ranges**: View data across multiple time ranges, from a single day to the maximum available history.
*   **AI-Powered Chat**: Ask questions about stock performance and receive AI-generated answers based on the visible data.
*   **Responsive Design**: A clean and intuitive interface that works seamlessly across different devices.

## Tech Stack

### Backend

*   **Node.js**: A JavaScript runtime for building the server-side application.
*   **Express**: A fast and minimalist web framework for Node.js, used to create the REST API.
*   **yahoo-finance2**: A library for fetching historical stock data from Yahoo Finance.
*   [yahoo-finance2 docs](https://github.com/gadicc/node-yahoo-finance2/blob/devel/docs/modules/chart.md)
*   **OpenAI API**: Used for the AI-powered chat functionality.

### Frontend

*   **Angular**: A powerful framework for building single-page applications.
*   **ngx-charts**: A declarative charting framework for Angular.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
*   **SCSS**: A preprocessor scripting language that is interpreted or compiled into Cascading Style Sheets (CSS).

## Installation & Setup

### Prerequisites

*   [Node](https://nodejs.org/)
*   [OpenAI API key](https://platform.openai.com/settings/organization/api-keys)

### Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install the dependencies**:
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the `backend` directory and add your OpenAI API key:
    ```
    OPENAI_API_KEY=your_api_key_here
    ```

4.  **Start the backend server**:
    ```bash
    npm start
    ```
    The server will be running at `http://localhost:3000`.

### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install the dependencies**:
    ```bash
    npm install
    ```

3.  **Start the frontend development server**:
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:4200`.

## Usage Examples

Once the application is running, you can perform the following actions:

*   **Add a stock**: Enter a stock symbol (e.g., `GOOGL`, `NVDA`, `SCHG`) in the search bar and click "Add".
*   **Change the time range**: Click on the time range buttons (e.g., `1d`, `1y`, `max`) to view different historical data.
*   **Ask the AI a question**: Type a question into the chat input (e.g., "What was the highest price in the last month?") and click "Ask AI".

## License
This repository is provided under the [MIT License](LICENSE).