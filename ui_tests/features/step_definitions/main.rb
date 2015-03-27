#encoding: utf-8

Given(/^I provide allowed urls$/) do
  if !ENV['IN_BROWSER']
    page.driver.allow_url([
      "lh4.googleusercontent.com",
      "lh5.googleusercontent.com",
      "lh6.googleusercontent.com",
      "www.u2i.com",
      "fonts.googleapis.com",
    ])
  end
end

When(/^I visit "(.*?)"$/) do |url|
  visit url
end

When(/^I print page$/) do
  print page.html
end

When(/^I save page$/) do
  save_page("prints/print_#{DateTime.now().strftime('%Q')}.html")
end

When(/^I print screen$/) do
  page.save_screenshot("prints/print_#{DateTime.now().strftime('%Q')}.png")
end

When(/^I hover over xpath "(.*?)" "(.*?)"$/) do |attribute, value|
  page.first(:xpath, "//*[@#{attribute}='#{value}']").hover
end

When(/^I hover over css "(.*?)"$/) do |css|
  if ENV['IN_BROWSER']
    page.first(:css, css).hover
  else
    page.execute_script("$('#{css}').trigger('mouseover')")
  end
end

When(/^I click xpath "(.*?)"$/) do |xpath|
  page.find(:xpath, xpath).click
end

When(/^I click text link "(.*?)"$/) do |link|
  page.find('a', :text => link).click
end

Then(/^I should see "(.*?)"$/) do |value|
  page.has_content?(value)
  # page.expect_to have_content value
end

When(/^I wait (\d+) seconds$/) do |seconds|
  sleep seconds.to_i
end

Then(/^I should find xpath "(.*?)"$/) do |value|
  page.find(:xpath, value)
end

When(/^I resize window to (\d+) (\d+)$/) do |width, height|
  if ENV['IN_BROWSER']
    Capybara.current_session.driver.browser.manage.window.resize_to(width, height)
  else
    page.driver.resize_window(width, height)
  end
end

Then(/^I check if site responses to different window sizes$/) do
  if ENV['IN_BROWSER']
    Capybara.current_session.driver.browser.manage.window.resize_to(400, 900)
    sleep 1
    Capybara.current_session.driver.browser.manage.window.resize_to(500, 900)
    sleep 1
    Capybara.current_session.driver.browser.manage.window.resize_to(700, 900)
    sleep 1
    Capybara.current_session.driver.browser.manage.window.resize_to(900, 900)
    sleep 1
    Capybara.current_session.driver.browser.manage.window.resize_to(1100, 900)
    sleep 1
    Capybara.current_session.driver.browser.manage.window.resize_to(1300, 900)
    sleep 1
  # else
  #   page.driver.resize_window(width, height)
  end
end

