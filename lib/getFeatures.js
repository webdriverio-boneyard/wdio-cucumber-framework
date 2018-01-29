import {getFeatures} from 'cucumber/lib/cli/helpers'

export function fixedGetFeatures (options) {
    return getFeatures(options).then(features => {
        const includeTags = options.tags.filter(tag => /^[^~].+$/.test(tag))
        const excludeTags = options.tags.filter(tag => /^~.+$/.test(tag)).map(tag => tag.replace(/~/g, ''))

        return features.map(feature => {
            const filteredFeature = feature
            if (includeTags.length > 0) {
                filteredFeature.scenarios = filteredFeature.scenarios
                    .filter(scenario => {
                        return scenario.tags.find(tag => includeTags.includes(tag.name) && !excludeTags.includes(tag.name))
                    })
            }
            if (excludeTags.length > 0) {
                filteredFeature.scenarios = filteredFeature.scenarios
                    .filter(scenario => {
                        return !scenario.tags.find(tag => excludeTags.includes(tag.name))
                    })
            }
            return filteredFeature
        })
    })
}
