Feature: Test if site works
  In order to make sure that website is running
  I want to open it

  Scenario: Open Perficio app
    Given I provide allowed urls
    When I visit "http://localhost:3000"
    Then I should see "Users"
    When I hover over xpath "title" "Jacek Kręcioch"
    Then I should see "Jacek Kręcioch"
    When I click text link "Achievements"
    Then I should see "Achievements"
    When I hover over css ".profile"
    Then I should see "39 Combos"
    Then I check if site responses to different window sizes