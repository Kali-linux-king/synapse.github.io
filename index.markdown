---
layout: home
title: "Synapse: Curated Knowledge Hub"
description: "Discover interconnected ideas with expert-curated resources"
monetization:
  enabled: true
  featured_affiliates:
    - title: "Recommended AI Books"
      link: "/ai-books"
      cta: "See Recommendations"
    - title: "Developer Tools"
      link: "/dev-tools"
      cta: "Explore Deals"
---

# Welcome to {{ site.title }} 

<div class="hero">
  <p class="tagline">{{ site.description }}</p>
  {% include particles-js.html %}
</div>

## Featured Pathways

<div class="pathway-grid">
  <!-- Cognitive Science -->
  <div class="pathway-card">
    <h3>🧠 Cognitive Science</h3>
    <p>Explore how the mind processes information</p>
    <a href="/cognitive-science" class="btn">Start Learning</a>
    <div class="affiliate-badge" data-tooltip="Contains affiliate links">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
      </svg>
    </div>
  </div>

  <!-- AI & ML -->
  <div class="pathway-card">
    <h3>🤖 Artificial Intelligence</h3>
    <p>Latest breakthroughs and learning resources</p>
    <a href="/artificial-intelligence" class="btn">Explore AI</a>
  </div>
</div>

## Monetization Disclaimer

{% include affiliate-disclaimer.html %}

<style>
/* Professional Homepage Styling */
.hero {
  position: relative;
  padding: 4rem 2rem;
  text-align: center;
  margin-bottom: 3rem;
}

.pathway-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.pathway-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 2rem;
  position: relative;
  transition: transform 0.3s ease;
}

.pathway-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.affiliate-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #FFD700;
  cursor: help;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 1rem;
}
</style>