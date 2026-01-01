# HookFilter 

**The programmable webhook gateway for developers.**

HookFilter sits between your third-party integrations (Stripe, GitHub, Shopify) and your backend. It allows you to inspect, filter, and transform incoming webhook payloads using `jq` before they ever reach your server.

## Why HookFilter?

Building custom handlers for every webhook provider is tedious.
* **Stripe** sends too much data? -> *Filter it down to just the ID.*
* **GitHub** sends nested JSON? -> *Flatten it before processing.*
* **Spammy webhooks?** -> *Drop them at the gateway.*

## Features

* **High-Performance Ingestion:** Non-blocking HTTP ingestion backed by Redis queues.
* **JQ Transformation:** Use standard `jq` syntax to restructure, rename, or reduce JSON payloads.
* **Real-Time Observability:** Watch webhooks arrive and transform live via WebSockets.
* **Resiliency:** Reliable buffering—if your app is down, webhooks wait in the queue.
* **Audit Logs:** specific history of every event, original vs. transformed payload.

## Tech Stack

* **Language:** Go (Golang) 1.21+
* **Queue/Cache:** Redis (Pub/Sub & Lists)
* **Database:** PostgreSQL (with `pgx` & `sqlc`)
* **Transformation Engine:** `gojq` (Pure Go implementation of jq)

