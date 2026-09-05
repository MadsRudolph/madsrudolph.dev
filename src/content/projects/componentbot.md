---
title: 'Componentbot: a local parts assistant'
summary: >-
  An offline assistant that answers component-stock questions using the DTU shop inventory and a local language model.
date: 2026-01-10
tags: ['Python', 'LLM', 'Ollama', 'Prompt engineering', 'RAG / grounding', 'CLI tool']
repo: 'https://github.com/MadsRudolph/Componentbot'
order: 9
status: working
hero: ''
heroAlt: 'Componentbot terminal session answering a component query'
---

Personal project using Python, Ollama, and Llama 3.2. The shop inventory is included with each query.

## The challenge

The default context window silently truncated the inventory. Increasing it to **32,768 tokens** let the model receive the full catalogue. UTF-8 output handling also fixed Windows console crashes.

## Results

- Natural-language lookup against roughly **1,465 inventory entries**.
- Runs locally without API keys or cloud requests.
- Inventory instructions and lower-temperature sampling reduce invented recommendations; they do not guarantee correctness.

[Code, design files & full documentation →](https://github.com/MadsRudolph/Componentbot)
