---
layout: page
title: "About Synapse"
description: "Our mission to connect knowledge and support open learning"
monetization:
  support_links:
    - text: "Support us on Ko-fi"
      url: "https://ko-fi.com/yourusername"
      icon: "fas fa-coffee"
    - text: "Become a sponsor"
      url: "/sponsors"
      icon: "fas fa-hand-holding-heart"
---

<div class="about-container">

![Synapse Knowledge Network](/assets/images/synapse-network.png){: .about-hero }

## Our Mission

Synapse is an open knowledge hub dedicated to **interconnecting ideas** across disciplines. We combine:

- 🧠 **Curated insights** from experts
- 🔗 **Intelligent connections** between concepts
- 💡 **Practical resources** for continuous learning

<div class="monetization-notice">
{% include affiliate-disclaimer.html %}
</div>

## The Team

<div class="team-grid">

<div class="team-member">
![Your Name](/assets/images/team/yourname.jpg){: .avatar }
### Your Name
<small>Founder & Curator</small>
<div class="social-links">
<a href="https://github.com/yourusername"><i class="fab fa-github"></i></a>
<a href="https://twitter.com/yourhandle"><i class="fab fa-twitter"></i></a>
</div>
</div>

<!-- Add more team members as needed -->

</div>

## Support Our Work

<div class="support-options">
{% for link in page.monetization.support_links %}
<a href="{{ link.url }}" class="support-button">
<i class="{{ link.icon }}"></i> {{ link.text }}
</a>
{% endfor %}
</div>

</div>

<style>
/* About Page Styling */
.about-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.about-hero {
  width: 100%;
  border-radius: 8px;
  margin: 2rem 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.team-member {
  text-align: center;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #4f46e5;
}

.social-links {
  margin-top: 1rem;
}

.social-links a {
  color: #4f46e5;
  margin: 0 0.5rem;
  font-size: 1.2rem;
}

.support-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 2rem 0;
}

.support-button {
  padding: 0.8rem 1.5rem;
  background: #4f46e5;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.monetization-notice {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin: 2rem 0;
  border-left: 4px solid #4f46e5;
}

@media (max-width: 768px) {
  .team-grid {
    grid-template-columns: 1fr;
  }
}
</style>