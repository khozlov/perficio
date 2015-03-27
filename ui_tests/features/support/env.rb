#encoding: utf-8

require 'rubygems'
require "capybara"
require "capybara/cucumber"
require 'capybara/webkit'



selenium = false

if ENV['IN_BROWSER']
  # On demand: non-headless tests via Selenium/WebDriver
  # To run the scenarios in browser (default: Firefox), use the following command line:
  # IN_BROWSER=true bundle exec cucumber
  # or (to have a pause of 1 second between each step):
  # IN_BROWSER=true PAUSE=1 bundle exec cucumber
  Capybara.default_driver = :selenium
  AfterStep do
    sleep (ENV['PAUSE'] || 0).to_i
  end
  selenium = true
else
  # DEFAULT: headless tests with webkit
  Capybara.register_driver :webkit do |app|
    options = {
        :js_errors => true,
        :timeout => 120,
        :debug => true,
        :phantomjs_options => ['--load-images=true', '--disk-cache=false'],
        :inspector => true
    }
    Capybara::Webkit::Driver.new(app, options).
      tap { |d| d.browser.ignore_ssl_errors }
  end
  Capybara.default_driver    = :webkit
  Capybara.javascript_driver = :webkit
end

# # configure the base urls
# $domain = ENV['RAILS_ENV'] == "development" ? "dev.scholastic.net" : "qa.scholastic.com"
# $sni_base_url = "http://sni-stage." + $domain + "/"
# $action_base_url = "http://action-stage." + $domain + "/"
# $ezpublisher_base_url = $sni_base_url + 'ezpublisher'

# def sni_url(path)
#   $sni_base_url + path
# end

# def action_url(path)
#   $action_base_url + path
# end

# def ez_url(path)
#   $ezpublisher_base_url + path
# end

# def replication_url(method)
#   $ezpublisher_base_url + '/resource/services/replication.cfc?method=' + method
# end

# def magazine_stage_url(magazine_name)
#   "http://#{magazine_name}-stage." + $domain
# end

# def magazine_url(magazine_name)
#   "http://#{magazine_name}." + $domain
# end

# # Used to fill ckeditor fields
# # @param [String] locator label text for the textarea or textarea id
# def fill_in_ckeditor(locator, params = {})
#   # Find out ckeditor id at runtime using its label
#   locator = find('label', text: locator)[:for] if page.has_css?('label', text: locator)
#   browser = page.driver.browser
#   # Fill the editor content
#   # browser.execute_script(“CKEDITOR.instances.SELECTOR.setData(‘test’)”)
#   browser.execute_script <<-SCRIPT
#       var ckeditor = CKEDITOR.instances.#{locator}
#       ckeditor.setData('#{params[:with].to_json}')
#       ckeditor.focus()
#       ckeditor.updateElement()
#   SCRIPT
# end

# def drag_drop(page, draggable, droppable, xoffset, yoffset)
#   driver = page.driver.browser
#   driver.mouse.move_to(draggable.native, draggable.native.size.height / 2, draggable.native.size.width / 2)
#   driver.mouse.down
#   driver.mouse.move_to(droppable.native, droppable.native.size.height / 2 + yoffset, droppable.native.size.width / 2 + xoffset)
#   driver.mouse.up
# end
