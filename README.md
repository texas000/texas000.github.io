# This Repositories is for testing

This Repositories is for testing. Please visit my personal website.

# PERSONAL WEBSITE
PLEASE VISIT MY [PERSONAL WEBSITE](http://smartjinny.com)

# Debugging

To debug the site locally, you can use Jekyll's built-in development server.

## Prerequisites

**Note:** macOS system Ruby is outdated and incompatible with modern macOS. You need to install Ruby via Homebrew.

1.  **Install Homebrew Ruby (one-time setup):**
    ```bash
    # Install Ruby via Homebrew
    brew install ruby
    
    # Add Homebrew Ruby to your PATH (add to ~/.zshrc)
    echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
    echo 'export PATH="/opt/homebrew/lib/ruby/gems/3.4.0/bin:$PATH"' >> ~/.zshrc
    
    # Reload your shell
    source ~/.zshrc
    
    # Verify you're using Homebrew Ruby
    ruby -v  # should show ruby 3.4.x
    ```

2.  **Install Bundler:**
    ```bash
    gem install bundler
    ```

## Running the Site

1.  **Install dependencies:**
    ```bash
    # Configure bundler for eventmachine (required for macOS)
    bundle config build.eventmachine --with-cppflags=-I$(xcrun --show-sdk-path)/usr/include/c++/v1
    
    # Install gems
    bundle install
    
    # Install npm packages
    npm install
    ```

2.  **Development (with hot reload):**
    ```bash
    npm run dev
    # or
    npm run serve
    ```
    This will:
    - Watch and rebuild Tailwind CSS on changes
    - Run Jekyll server with live reload

3.  **Build for production:**
    ```bash
    npm run build
    ```

4.  Open your browser to `http://localhost:4000`.

## Design System

This site uses a custom Tailwind CSS design system with:

- **Primary Colors**: Blue gradient (`primary-400` to `primary-600`)
- **Dark Theme**: Dark slate colors (`dark-50` to `dark-950`)
- **Custom Animations**: fade-in, slide-in, slide-down
- **Responsive Navigation**: Mobile hamburger menu with modal
- **Typography**: Inter font family with custom spacing

### Customizing Colors

Edit `tailwind.config.js` to modify the color scheme:

```javascript
colors: {
  primary: { /* your colors */ },
  dark: { /* your colors */ }
}
```

### Custom Components

The site includes reusable component styles in `assets/css/input.css`:
- `.section-title` - Section headings
- `.skill-card` - Skill display cards
- `.experience-card` - Experience timeline cards
- `.project-card` - Project showcase cards
- `.nav-link` - Navigation links with active state
- `.mobile-nav-link` - Mobile menu items

## SEO Optimization

This site is fully optimized for search engines:

### Features

- **robots.txt**: Allows all search engine bots to crawl the site
- **sitemap.xml**: Automatically generated via `jekyll-sitemap` plugin
- **RSS Feed**: Available at `/feed.xml`
- **Meta Tags**: Comprehensive SEO meta tags including:
  - Open Graph (Facebook, LinkedIn)
  - Twitter Cards
  - Canonical URLs
  - Structured Data (JSON-LD)

### How to Add SEO to Blog Posts

Add these fields to your post's front matter:

```yaml
---
layout: post
title: "Your Post Title"
date: 2025-11-03 11:00:00 -0500
categories: [category1, category2]
tags: [tag1, tag2, tag3]
author: Your Name
excerpt: "A brief description of your post (160 characters or less)"
image: /assets/images/post-image.png
reading_time: 5분
---
```

### SEO Best Practices

1. **Title**: Keep it under 60 characters
2. **Excerpt**: Write compelling descriptions under 160 characters
3. **Tags**: Use relevant, searchable keywords
4. **Images**: Always include an og:image for social sharing
5. **URLs**: Use descriptive, keyword-rich URLs

### Check Your SEO

- **Sitemap**: Visit `https://texas000.github.io/sitemap.xml`
- **RSS Feed**: Visit `https://texas000.github.io/feed.xml`
- **Robots**: Visit `https://texas000.github.io/robots.txt`

### Submit to Search Engines

1. **Google Search Console**: Submit your sitemap at `https://search.google.com/search-console`
2. **Bing Webmaster Tools**: Submit at `https://www.bing.com/webmasters`
3. **Naver Search Advisor**: Submit at `https://searchadvisor.naver.com`
