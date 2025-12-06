# Makcu Project

## Project Introduction

This project is the official website of makcu, developed using the React framework, and is mainly used to display makcu's documents/online tools/related information, etc.

## Environmental Requirements
- Node.js Version: [22.x.x]

## Installation

First, clone the repository:

```bash
git clone https://github.com/MakcuTeam/Website project-name
cd project-name

# Initialize submodules if needed
git submodule sync
git submodule update --init --recursive
```

Install dependencies:

```bash
pnpm install
```

## Usage

### Development mode

```bash
pnpm dev
```

### Build a production version

```bash
pnpm build
```

### Run tests

```bash
pnpm start
```

## Environment Variables

The API routes that list firmware files query the GitHub API. If you exceed the
unauthenticated rate limit (60 requests per hour), set `GITHUB_TOKEN` to a
personal access token to increase the limit. 

<!-- CI test trigger change -->