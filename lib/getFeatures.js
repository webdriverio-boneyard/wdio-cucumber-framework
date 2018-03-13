import { getFeatures } from 'cucumber/lib/cli/helpers'
import { _ } from 'lodash'
import path from 'path'

export async function fixedGetFeatures(options) {
    let initialFeatures = await getFeatures(options);
    let templates = findTemplates(initialFeatures);
    templates = _.compact(_.flattenDeep(templates));

    let features = templates.map(async (template) => {
        let pathToFeatureFile = template.stepName.replace(/^Using template "([^"]*)"$/g, '$1');
        options.featurePaths = [path.normalize(path.resolve(pathToFeatureFile))];
        let templatedScenarios = await getFeaturesFromTemplate(options);
        let pointScenario = initialFeatures[template.feature].scenarios[template.scenario];
        let opt = {
            feature: pointScenario.feature,
            lastStep: pointScenario.steps[pointScenario.steps.length - 1].line
        }
        initialFeatures[template.feature].scenarios.splice(parseInt(template.scenario) + 1, 0, ...preparingScenariosForConcat(templatedScenarios[0], opt));
        return initialFeatures[template.feature];
    });

    const includeTags = options.tags.filter(tag => /^[^~].+$/.test(tag))
    const excludeTags = options.tags.filter(tag => /^~.+$/.test(tag)).map(tag => tag.replace(/~/g, ''))

    return features.map(feature => {
        const filteredFeature = feature;
        if (includeTags.length > 0) {
            filteredFeature.scenarios = filteredFeature.scenarios
                .filter(scenario => {
                    return scenario.tags.find(tag => includeTags.includes(tag.name))
                })
        }
        if (excludeTags.length > 0) {
            filteredFeature.scenarios = filteredFeature.scenarios
                .filter(scenario => {
                    return !scenario.tags.find(tag => excludeTags.includes(tag.name))
                })
        }
        return filteredFeature
    });
}

function findTemplates(features) {
    return features.map((feature, fIndex) => {
        return feature.scenarios.map((scenario, sIndex) => {
            return scenario.steps.map((step, index) => {
                if (step.name.includes('Using template')) {
                    return {
                        feature: fIndex,
                        scenario: sIndex,
                        stepIndex: index,
                        stepName: step.name
                    }
                }
            });
        });
    });
};

async function getFeaturesFromTemplate(options) {
    return await getFeatures(options).map(feature => {
        return feature.scenarios
    });
}

function preparingScenariosForConcat(scenarios, options) {
    let emptyLine = parseInt(options.lastStep) + 1;
    return scenarios.map(scenario => {
        scenario.feature = options.feature;
        scenario.line = emptyLine;
        emptyLine++;
        scenario.steps = scenario.steps.map(step => {
            step.line = emptyLine;
            emptyLine++;
            return step;
        });
        scenario.feature.lastStep = emptyLine - 1;
        return scenario;
    });
}