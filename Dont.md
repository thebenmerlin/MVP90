# 🚀 MVP90 Terminal  
*A production-ready venture intelligence platform with live data, real-time metrics and a Bloomberg-style interface.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-mvp90.vercel.app-blue)](https://mvp-90.vercel.app)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  

---

## 🎯 Why MVP90?  
Imagine a terminal built for VCs, LPs and startup analysts — pulling live data, scoring signals, tracking founders, products and ideas — all in one ultra-dense interface.

> “A Bloomberg-style venture intelligence terminal for VCs, LPs, and analysts.” — Project description  

---

## 🧩 Core Features  

### 1. Dive Module (Deep Analytics)  
- 26 live metrics across 5 high-impact categories:  
  - **Founder Quality** – GitHub activity, repo ownership, recent dev activity  
  - **Product Traction** – Product Hunt presence, GitHub stars, commit frequency  
  - **Engagement & Behaviour** – watch-lists, click-throughs, revisit patterns  
  - **Scoring & System Signals** – originality, replicability, freshness, saturation  
  - **Platform & Ecosystem** – saves, routing popularity, tag rarity, velocity  
- 5 key visualisations:  
  - Signal velocity trend (12-week sparkline)  
  - Product Hunt launch performance bar chart  
  - GitHub stars growth: cumulative/∆ line chart  
  - Originality benchmark: horizontal comparison bars  
  - Idea saturation heatmap: category-rarity matrix  

### 2. Raw Signal Breakdown  
- Info icons (ℹ) on startup/founder cards  
- Detailed modal view showing:  
  - Source metadata with confidence scores  
  - Signal processing chain (scraped → enriched → scored)  
  - ML classification tags, associated links, quality score  

### 3. Clickable Score Explainers  
- Interactive scores: click to view breakdown  
- Formula visualisation: weighted components with stacked bars  
- Comparable analysis: top-3 similar entities + benchmarking  
- AI-generated insights ready for LLM integration  

### 4. Hover Tooltips & Keyboard-Driven Navigation  
- Hover any metric to reveal explanation  
- Keyboard accessible (Tab, Enter/Space) + dedicated shortcuts  
- Instant state changes, minimal animations  

---

## 🎨 UI / UX Design System  
- Ultra-dense layout: 2-4px padding, maximised information density  
- Monospace typography for metrics & tables  
- Sharp rectangular components (zero radius, no shadows)  
- High-contrast dark theme (optimized for long use)  
- Keyboard-first navigation: F1-F12 shortcuts, tab navigation  
- Colour palette:  
  ```css
  --terminal-bg: #0a0a0a;
  --terminal-surface: #1a1a1a;
  --terminal-border: #333333;
  --terminal-text: #ffffff;
  --success: #00ff88;  /* scores >= 8 */
  --warning: #ffaa00;  /* scores 6-7 */
  --error:   #ff4444;  /* scores <6 */
  --info:    #00aaff;
  --chart-primary:   #00ff88;
  --chart-secondary: #00aaff;
  --chart-tertiary:  #ffaa00;
