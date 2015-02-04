PIXI.CrossFadeFilter = function(texture)
{
    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        inTex: {
            type:'sampler2D',
            value: texture
        },
        progress: {
            type: '1f',
            value: 0
        }
    };

    this.fragmentSrc = [
        "precision mediump float;",
        "uniform sampler2D inTex;",
        "uniform float progress;",
        'uniform sampler2D uSampler;',
        "varying vec2 vTextureCoord;",
        "void main()",
        "{",
            "vec2 vTextureCoord_invert = vec2(vTextureCoord.x, 1.0-vTextureCoord.y);",
            "vec4 col=texture2D(inTex, vTextureCoord);",
            "vec4 col2=texture2D(uSampler, vTextureCoord);",
            "gl_FragColor = mix(col, col2, progress);",
        "}"
    ];


};

PIXI.CrossFadeFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.CrossFadeFilter.prototype.constructor = PIXI.CrossFadeFilter;

Object.defineProperty(PIXI.CrossFadeFilter.prototype, 'progress', {
    get: function() {
        return this.uniforms.progress.value;
    },
    set: function(value) {
        this.uniforms.progress.value = value;
        if(this.uniforms.progress.value<0)
            this.uniforms.progress.value = 0;
        else if(this.uniforms.progress.value>1)
            this.uniforms.progress.value = 1;
    }
});


