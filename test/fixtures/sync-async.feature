Feature: Example feature
  As a test script of wdio-cucumber-framework
  I should pass if I understand async and sync

  Scenario: Foo Bar
    Given I go on the website "http://webdriver.io" the async way
    When  I click on link "=Google"
    Then  should the title of the page be "Google" the async way

  Scenario: Foo Bar Doo
    Given I go on the website "http://webdriver.io"
    When  I click on link "=Google" the async way
    Then  should the title of the page be "Google"
    Then  should true be true