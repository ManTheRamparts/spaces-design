/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


define(function (require, exports, module) {
    "use strict";

    var React = require("react"),
        Fluxxor = require("fluxxor"),
        FluxMixin = Fluxxor.FluxMixin(React),
        Immutable = require("immutable");
        
    var Gutter = require("jsx!js/jsx/shared/Gutter"),
        Label = require("jsx!js/jsx/shared/Label"),
        NumberInput = require("jsx!js/jsx/shared/NumberInput"),
        strings = require("i18n!nls/strings"),
        synchronization = require("js/util/synchronization"),
        collection = require("js/util/collection");

    var MAX_LAYER_POS = 32768,
        MIN_LAYER_POS = -32768;

    var Position = React.createClass({
        mixins: [FluxMixin],

        /**
         * A debounced version of actions.transform.setPosition
         * 
         * @type {?function}
         */
        _setPositionDebounced: null,

        componentWillMount: function() {
            var flux = this.getFlux(),
                setPosition = flux.actions.transform.setPosition;

            this._setPositionDebounced = synchronization.debounce(setPosition);
        },

        /**
         * Update the left position of the selected layers.
         *
         * @private
         * @param {SyntheticEvent} event
         * @param {number} newX
         */
        _handleLeftChange: function (event, newX) { 
            var document = this.props.document;
            if (!document) {
                return;
            }
            
            this._setPositionDebounced(document, document.layers.selected, {x: newX});
        },

        /**
         * Update the top position of the selected layers.
         *
         * @private
         * @param {SyntheticEvent} event
         * @param {number} newY
         */
        _handleTopChange: function (event, newY) { 
            var document = this.props.document;
            if (!document) {
                return;
            }
            
            this._setPositionDebounced(document, document.layers.selected, {y: newY});
        },

        /**
         * Indicates whether the bounds should be visible or hidden
         * 
         * @private
         * @param {?Document} document
         * @param {Immutable.List.<Bounds>} bounds
         * @param {boolean}
         */
        _isVisible: function (document, bounds) {
            return !document || !bounds.isEmpty();
        },

        /**
         * Indicates whether the bounds should be locked
         * 
         * @private
         * @param {Immutable.List.<Layers>} layers
         * @param {boolean}
         */
        _isLocked: function (layers) {
            return layers.isEmpty() ||
                layers.every(function (layer) {
                    return layer.kind === layer.layerKinds.GROUPEND ||
                        layer.locked ||
                        layer.isBackground;
                }) ||
                layers.some(function (layer) {
                    return (layer.bounds && layer.bounds.area === 0);
                });
        },

        render: function () {
            var document = this.props.document,
                layers = document ? document.layers.selected : Immutable.List(),
                bounds = document ? document.layers.selectedChildBounds : Immutable.List(),
                visible = this._isVisible(document, bounds);

            if (!visible) {
                return null;
            }

            var locked = this._isLocked(layers),
                tops = collection.pluck(bounds, "top"),
                lefts = collection.pluck(bounds, "left");

            return (
                <div className="formline">
                    <Label
                        title={strings.TOOLTIPS.SET_X_POSITION}>
                        {strings.TRANSFORM.X}
                    </Label>
                    <Gutter />
                    <NumberInput
                        disabled={locked}
                        value={lefts}
                        onChange={this._handleLeftChange}
                        ref="left"
                        min={MIN_LAYER_POS}
                        max={MAX_LAYER_POS}
                        size="column-5" />
                    <Gutter
                        size="column-4" />
                    <Label
                        title={strings.TOOLTIPS.SET_Y_POSITION}
                        size="column-1">
                        {strings.TRANSFORM.Y}
                    </Label>
                    <Gutter />
                    <NumberInput
                        disabled={locked}
                        value={tops}
                        onChange={this._handleTopChange}
                        ref="top"
                        min={MIN_LAYER_POS}
                        max={MAX_LAYER_POS}
                        size="column-5" />
                    <Gutter />
                </div>
            );
        }
    });

    module.exports = Position;
});
