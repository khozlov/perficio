Feature: Test main nav
  In order to make sure the main nav works
  I want to click it through

  Scenario: Open Perficio app
    Given I provide allowed urls
    When I visit "http://localhost:3000"
    Then I should see "Users"
    When I click text link "Achievements"
    Then I should see "Achievements"
    When I click text link "Feedback"
    Then I should see "We love feedback!"
    When I close popup
    And I click text link "Login"
    Then I should see "Sign in with your Google Account"
    When I visit "http://localhost:3000"
    And I choose first user
    And I wait 2 seconds
    Then I should see "Achievements"
    When I choose first achievement
    And I wait 2 seconds
    Then I should see "39 Combos"