# ========================
#  GEMFILE FOR SYNAPSE HUB
# ========================
source "https://rubygems.org"

# Core Jekyll + GitHub Pages
gem "jekyll", "~> 4.3.3"
gem "github-pages", "~> 228", group: :jekyll_plugins

# =================
#  MONETIZATION TOOLS
# =================
gem "jekyll-affiliate", "~> 1.0"  # For managing affiliate links
gem "jekyll-sponsors", "~> 0.2"   # Sponsor management

# =================
#  CONTENT ENHANCEMENTS
# =================
group :jekyll_plugins do
  gem "jekyll-seo-tag", "~> 2.8"     # Advanced SEO
  gem "jekyll-sitemap", "~> 1.4"     # Auto sitemap
  gem "jekyll-archives", "~> 2.2"    # Tag/category pages
  gem "jekyll-include-cache", "~> 0.2" # Performance
  gem "jekyll-minifier", "~> 0.1.10" # HTML/CSS compression
end

# =================
#  DEVELOPMENT TOOLS
# =================
group :development do
  gem "jekyll-watch", "~> 2.0"
  gem "webrick", "~> 1.7"          # Required for Ruby 3+
  gem "html-proofer", "~> 5.0"     # Link checking
end

# =================
#  OPTIONAL PREMIUM PLUGINS
# =================
# Uncomment if needed:
# gem "jekyll-subscribers", "~> 1.0" # Paywall content
# gem "jekyll-email-protect", "~> 1.1" # Obfuscate emails

# =================
#  PERFORMANCE OPTIMIZATION
# =================
install_if -> { RUBY_PLATFORM =~ /x86_64-linux/ } do
  gem "libv8", "~> 8.4"            # Faster JS processing
end

# =================
#  RUBY VERSION LOCK
# =================
ruby "~> 3.1.4" # Matches GitHub Pages runtime