import {getFeatures} from 'cucumber/lib/cli/helpers'

export function fixedGetFeatures (options) {
    return getFeatures(options).then((features) => {
        // const tags = options.tagExpression.split(/\s*,\s*/)
        const tags = options.tags
        return features.map(feature => {
            const filteredFeature = feature
            filteredFeature.scenarios = filteredFeature.scenarios.filter(scenario => {
                return scenario.tags.find(tag => tags.includes(tag.name))
            })
            return filteredFeature
        })
    })
}
