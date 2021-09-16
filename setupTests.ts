expect.extend({
    toTypeMatch(value,name) {
        if(!value?.match){
            return {
                pass: this.isNot,
                message: () => `Expected ${value} to have match function`
            }
        } else {
            const matched = value.match({
                [name]: true,
                _: false
            })
            if( matched ){
                return {
                    pass: true,
                    message: () => `Expected ${value} to not match to ${name}`
                }
            } else {
                return {
                    pass: false,
                    message: () => `Expected ${value} to match to ${name}`
                }
            }
        }
    }
})