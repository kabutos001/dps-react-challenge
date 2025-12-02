## DPS Frontend Coding Challenge: German Address Validator

This is my submission for the DPS front-end challenge you prodivded.

## Description of Solution

I implemented both form fields as asked and included appropriate error handling in case a locality/ PLZ was not found or the API could not be reached or similar.
I have also included a debounce of one second for both fields. The debounce value will be used for the API request if the user has not typed anything for a full second.

The project can be run just like any react application using `npm i` followed by `npm run dev`.


## AI Usage Statement

I have utilized the lovable.dev agent exclusively for the design of the website. It gave me a design i deemed fitting for this the challenge after a single prompt:

`I need you to build some non-distracting, easy to look at ui components for a single-page react application. Build at least an input, a dropdown, a title and some paper component which the other elements can sit in for visual separation. Be sure to include a dark theme. The theme should fit an official website for looking up information - think intuitive, clean. I also need a spinner (loading).`
I published the whole project which was generated from the prompt in [this](https://github.com/kabutos001/dps-frontend-components) repository.

## Additional Thoughts

This was my first time trying out such a full-fledged AI agent which fully implements your prompt on its own and have to admit that i was very impressed by how well it looked. I think utilizing AI tools to a certain (healthy) extent can really boost productivity for a time-critical project such as the DPS.

