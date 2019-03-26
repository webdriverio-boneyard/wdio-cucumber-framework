Feature: Tags feature
  As a test script of wdio-cucumber-framework
  I should only execute scenarios matching the tag expression
  So that only the right scenarios are executed

  Background: Repeated setup
    Given I go on the website "http://webdriver.io"

  Scenario Outline: Clicking the link opens the right page
     When  I click on link "<link>"
     Then  should the title of the page be "<pageTitle>"

     @ex1
     Examples:
         | link          | pageTitle |
         | =Google       | Google    |
         | =Also Google  | Google    |

    @ex2
    Scenario: Foo Bar
        When  I click on link "=Google"
        Then  should the title of the page be "Google"
