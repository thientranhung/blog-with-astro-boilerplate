---
title: "Introduction to the Obsidian → Astro Pipeline"
published: true
slug: intro-obsidian-astro
description: "An overview of how to sync content from Obsidian to Astro SSG."
excerpt: "A pipeline that automatically converts Obsidian notes into Astro blog posts."
tags:
  - obsidian
  - astro
  - pipeline
series: obsidian-to-astro
lang: en
translationKey: intro-obsidian-astro
created: 2026-05-01
updated: 2026-05-10
---

# Introduction to the Obsidian → Astro Pipeline

This post introduces the pipeline I built to automatically sync content from my Obsidian vault to an Astro blog.

## Why

Obsidian is my daily note-taking tool. I wanted to publish directly from the vault without manual copy-paste.

## Architecture

The pipeline has three steps:

1. Scan the vault, filter notes with `published: true`
2. Resolve wikilinks, upload images to R2
3. Generate JSON manifests for Astro

See [[backlinks-and-wikilinks]] for how cross-post linking works.

> [!note]
> The pipeline runs before `astro dev` and `astro build`. Astro only reads normalized output.
