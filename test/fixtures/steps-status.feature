Feature: Steps status

  Scenario: Failing test
    Given Test will fail
    And this step will be skipped
    Then this step will be skipped

  Scenario: Pending
    Given Pending test
