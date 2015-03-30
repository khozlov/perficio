Feature: Test User
  In order to make sure the user feature works
  I want to click it through

  Scenario: Open user
    Given I provide allowed urls
    When I visit "http://localhost:3000"
    Then I should see "Users"
    And I choose first user
    And I wait 2 seconds
    And I print screen
    Then I should see "Achievements"
    When I choose first achievement
    And I wait 2 seconds
    And I print screen
    Then I should see "39 Combos"
    And I should see "Granted by"
    And I print screen
    When I close popup
    And I choose second achievement
    Then I should see "Grant Achievement"
    And I close popup