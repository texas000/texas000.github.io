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

The site includes reusable component styles in `index.html`:
- `.section-title` - Section headings
- `.skill-card` - Skill display cards
- `.experience-card` - Experience timeline cards
- `.project-card` - Project showcase cards
