Feature: Synchronous custom commands

  Scenario: Execute
    Then custom wdio
    Then custom wdio promise
    Then custom native promise
    Then custom q promise
    Then custom command wrapping custom wdio
    Then custom command wrapping custom wdio promise
    Then custom command wrapping two native promise commands
    Then custom command wrapping wdio command treated as promise resolves
