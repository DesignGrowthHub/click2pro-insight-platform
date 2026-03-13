# Planned Architecture

## System Split

- `click2pro.com`: existing blog and content distribution layer
- `insight.click2pro.com`: assessment, checkout, report, and account layer

## Core Product Systems

1. Topic routing system
2. Assessment engine
3. Report generation layer
4. Commerce layer
5. Account history and entitlements
6. Admin configuration tools
7. Analytics and funnel reporting

## Recommended Starting Shape

- Web app frontend for assessment and report flows
- Server-side storage for users, responses, purchases, mappings, and report definitions
- Config-driven assessment and popup mapping models
- Payment integration for one-time and recurring products
- Event tracking across blog popup, assessment completion, and checkout

## Data Models To Expect

- Assessments
- Questions
- Scoring bands
- Reports
- Blog topic mappings
- Offers
- Purchases
- Subscriptions
- Users

## Architecture Principles

- Keep assessment definitions reusable and data-driven.
- Keep popup mapping logic separable from the main assessment app.
- Support adding new assessments without rebuilding the entire flow.
- Avoid coupling report writing too tightly to frontend components.

## Current Status

This repository is in planning mode only. No framework, dependencies, or runtime architecture have been installed yet.
