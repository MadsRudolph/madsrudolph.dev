---
title: 'Componentbot: a grounded local-LLM assistant for the parts shop'
summary: >-
  A small offline tool that answers "do we have this component?" in natural
  language — a local Llama model grounded on the DTU shop's real inventory so it
  only ever recommends parts that are actually in stock.
date: 2026-01-10
tags: ['Python', 'LLM', 'Ollama', 'Prompt engineering', 'RAG / grounding', 'CLI tool']
repo: 'https://github.com/MadsRudolph/Componentbot'
order: 9
status: working
hero: ''
heroAlt: 'Componentbot terminal session answering a component query'
---

<!-- PHOTO NEEDED: a terminal screenshot of a real session — e.g. asking "Do you have a 4.7k resistor?" and Componentbot answering with the exact part number. -->
<div class="media-placeholder">HERO: Componentbot terminal session</div>

## What it is

The DTU component shop stocks 1,400+ through-hole parts, catalogued in a CSV. Finding out whether a specific value is in stock — a 4.7 kΩ resistor, a particular op-amp, the closest capacitor to 100 µF — meant scrolling a spreadsheet. **Componentbot is a small command-line tool that answers those questions in plain language, using a local LLM (Llama 3.2 via Ollama) that has been grounded on the real inventory so it only recommends parts that actually exist in the shop.** It runs entirely offline — no data leaves the machine, no API keys, no cost.

I'm including this deliberately as an example of how I use and build with AI: not as a chatbot wrapper, but as a grounded tool where the interesting work is keeping the model honest.

## Problem / motivation

A language model asked "do you have a 3.3 kΩ resistor?" will answer confidently — and it will happily invent a part number or recommend something the shop doesn't carry, because a raw model has no idea what's on the shelves. That failure mode is the whole problem. A parts assistant that hallucinates stock is worse than no assistant, because a student trusts it and orders air. The engineering here isn't "call an LLM"; it's making the answer *true*.

## Architecture / approach

The tool is deliberately small (~420 lines of Python, no dependencies beyond the standard library and a running Ollama):

- **Inventory load** — parses the shop CSV (`Category, Subcategory, Part_Number, Value, Description`, 1,465 rows) into memory.
- **Grounding** — builds a system prompt that injects the *entire* inventory as pipe-delimited lines, under hard rules ("ONLY recommend components in the inventory below; if a value doesn't exist, recommend the closest one that does"), plus domain hints about the shop's resistor notation (`4K7` = 4.7 kΩ, `1M5` = 1.5 MΩ).
- **Inference** — posts to Ollama's local `/api/generate` endpoint at `temperature 0.3` for consistency, streaming the reply token-by-token to the terminal via `urllib`.
- **Preflight** — checks Ollama is running and the model is pulled (pulling it automatically if not) before starting the REPL.

The design is essentially retrieval-by-context: rather than a vector store, the whole catalogue is small enough to hand the model in full on every query, which makes the grounding exact instead of approximate.

<!-- DIAGRAM NEEDED: pipeline — shop CSV → system prompt (full inventory + rules) → Ollama (local) → grounded answer. I can draft this as inline SVG. -->
<div class="media-placeholder">DIAGRAM: CSV → grounded system prompt → local Ollama → answer</div>

## What went wrong and how it was diagnosed

**The model forgot most of the shop.** Injecting 1,465 inventory lines is a lot of text — roughly 20–30k tokens. With Ollama's default context window (a couple of thousand tokens), the inventory was silently truncated, so the model only "saw" the first slice of the catalogue and would claim parts didn't exist when they were sitting further down the list. The fix was to raise the request's context window to **`num_ctx: 32768`** so the full inventory actually fits in the prompt every time. This is the difference between a demo and a tool: if the grounding data gets truncated, grounding does nothing.

**Keeping it from inventing part numbers.** Even with the inventory present, a chatty model wants to be helpful and will paraphrase or fabricate a plausible-looking part number. Three things reined that in: the explicit CRITICAL RULES in the system prompt (only recommend what's listed; suggest the nearest *listed* value when an exact one is missing), dropping the sampling **temperature to 0.3** so answers stay close to the grounding data instead of getting creative, and giving the model the shop's own notation scheme so `4K7` reads as a real part, not a typo.

**The Ω symbol crashed it on Windows.** Component values are full of Unicode — `Ω`, `µ` — and on Windows the console defaults to cp1252, so the first time the model streamed a resistance back, printing it threw a `UnicodeEncodeError` and killed the session. Diagnosed it to the console encoding and fixed it by reconfiguring stdout to UTF-8 with `errors='replace'` on `win32` at startup (this is what the "Fix Windows compatibility issues" commit is). A one-line fix, but the kind that makes a tool actually usable by someone else on a different machine.

## Results

- A working offline assistant: ask in natural language, get an exact in-stock part number or the nearest available value, with no external calls.
- Grounded answers — the full 1,465-part inventory is in-context on every query, so recommendations stay inside what the shop actually carries.
- Runs on a laptop against a ~2 GB local model; no keys, no cloud, no per-query cost.

It's a small tool, and I'm honest about that — but it's a clean demonstration of the part of "using AI" that actually matters for engineering work: grounding a model in real data, constraining it, and fixing the failure modes (truncation, hallucination, encoding) that decide whether the output can be trusted.

<!-- VERIFY: if you want, confirm the model/version you currently run it with (README says llama3.2) and add a real transcript screenshot for the hero. -->

## Tools & skills demonstrated

Practical LLM engineering (grounding a model on real data, context-window sizing, prompt constraints, temperature control), local inference with Ollama, reading and structuring a real dataset, and the unglamorous cross-platform debugging (Windows console encoding) that separates a personal script from a tool other people can run.
