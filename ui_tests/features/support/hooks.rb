#encoding: utf-8

After do |scenario|
  if scenario.failed?
  	page.save_screenshot("errors/error_#{DateTime.now().strftime('%s')}.png")
    save_page("errors/error_#{DateTime.now().strftime('%s')}.html")
  end
end