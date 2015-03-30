When(/^I close popup$/) do
  find(:css, ".close").click
end

When(/^I choose first user$/) do
  first(:css, '.profile').click
end

When(/^I choose first achievement$/) do
  first(:css, '.profile').click
end