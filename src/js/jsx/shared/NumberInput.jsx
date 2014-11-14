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
        mathjs = require("mathjs"),
        _ = require("lodash");

    var Focusable = require("../mixin/Focusable"),
        math = require("js/util/math"),
        strings = require("i18n!nls/strings"),
        os = require("adapter/os"),
        log = require("js/util/log");

    var NumberInput = React.createClass({
        mixins: [Focusable],

        /**
         * Saved selection state.
         *
         * @private
         * @type {?number}
         */
        _selection: null,

        propTypes: {
            value: React.PropTypes.oneOfType([
                    React.PropTypes.number,
                    React.PropTypes.array
                ]),
            onChange: React.PropTypes.func.isRequired,
            step: React.PropTypes.number,
            bigstep: React.PropTypes.number,
            min: React.PropTypes.number,
            max: React.PropTypes.number
        },

        getDefaultProps: function () {
            return {
                value: null,
                step: 1,
                bigstep: 10,
                min: Number.NEGATIVE_INFINITY,
                max: Number.POSITIVE_INFINITY
            };
        },

        getInitialState: function () {
            var rawValue = this._formatValue(this.props.value);

            return {
                rawValue: rawValue,
                dirty: false
            };
        },

        componentWillReceiveProps: function (nextProps) {
            var rawValue = this._formatValue(nextProps.value);

            this.setState({
                rawValue: rawValue
            });
        },

        shouldComponentUpdate: function (nextProps, nextState) {
            if (nextState.rawValue !== this.state.rawValue ||
                nextState.dirty !== this.state.dirty ||
                !_.isEqual(nextProps.value, this.props.value)) {

                // If the component is about to update, save the selection state
                var node = this.refs.input.getDOMNode();
                if (document.activeElement === node) {
                    this._selection = [
                        node.selectionStart,
                        node.selectionEnd
                    ];
                }

                return true;
            }
            return false;
        },

        componentDidUpdate: function(prevProps, prevState) {
            if (this._selection !== null) {
                // If the component updated and there is selection state, restore it
                var node = this.refs.input.getDOMNode();
                if (document.activeElement === node) {
                    node.setSelectionRange.apply(node, this._selection);
                }
                this._selection = null;
            }
        },

        /**
         * Parses the input string to a valid number
         *
         * @param {string} rawValue value of the input field
         * @return {number} Value of the input field as a number or null if invalid
         */
        _extractValue: function (rawValue) {
            var value;
            try {
                /*jslint evil: true */
                value = mathjs.eval(rawValue);
                /*jslint evil: false */
                
                // Run it through our simple parser to get rid of complex and big numbers
                value = math.parseNumber(value);
            } catch (err) {
                value = null;
            }

            if (_.isFinite(value)) {
                return value;
            } else {
                return null;
            }
        },
        
        /*
         * Formats the number value into a string
         *
         * @param {?number|Array.<number>} value Value of the input
         * @return {string} empty string if null, number in string otherwise
         */
        _formatValue: function (value) {
            if (typeof value === "number") {
                return value.toString();
            } else if (value === null || value.length === 0) {
                return "";
            } else if (_.every(value, function (v) { return v === value[0]; })) {
                return value[0].toString();
            } else {
                return strings.TRANSFORM.MIXED;
            }
        },

        /**
         * Update the rawValue of the text input. We only call the external
         * onChange handler when the rawValue is committed.
         * 
         * @private
         * @param {SyntheticEvent} event
         */
        _handleChange: function (event) {
            this.setState({
                rawValue: event.target.value,
                dirty: true
            });
        },

        /**
         * Blur the input and release focus to Photoshop.
         * 
         * @private
         */
        _releaseFocus: function () {
            this.refs.input.getDOMNode().blur();
            os.releaseKeyboardFocus()
                .catch(function (err) {
                    log.error("Failed to release keyboard focus on reset", err);
                });
        },

        /**
         * Reset the rawValue of the text input according to the external value
         * 
         * @private
         * @param {SyntheticEvent} event
         */
        _reset: function (event) {
            if (this.state.dirty) {
                var rawValue = this._formatValue(this.props.value);
                this.setState({
                    rawValue: rawValue,
                    dirty: false
                });
            } else {
                this._releaseFocus();
            }

            event.stopPropagation();
        },

        /**
         * Commit the current value by calling the external onChange handler.
         * 
         * @private
         * @param {SyntheticEvent} event
         * @param {number} nextValue
         * @param {retainFocus}
         */
        _commit: function (event, nextValue, retainFocus) {
            if (retainFocus || this.state.dirty) {
                if (nextValue > this.props.max) {
                    nextValue = this.props.max;
                }

                if (nextValue < this.props.min) {
                    nextValue = this.props.min;
                }

                this.setState({
                    dirty: false
                });
                
                this.props.onChange(event, nextValue);                
            } else {
                this._releaseFocus();
            }

            event.stopPropagation();
        },

        /**
         * Handle non-printable keyboard input:
         * - Enter or Return to attempt to commit the value
         * - Escape to reset the value
         * - Up or down arrow to increment or decrement and commit the value
         * 
         * @private
         * @param {SyntheticEvent} event
         */
        _handleKeyDown: function (event) {
            var key = event.key;
            if (key === "Escape") {
                this._reset(event);
                return;
            }

            var nextValue,
                multiplier,
                increment;

            switch (key) {
            case "Return":
            case "Enter":
                nextValue = this._extractValue(event.target.value);
                if (nextValue === null) {
                    this._reset(event);
                } else {
                    this._commit(event, nextValue);
                }
                break;
            case "ArrowUp":
            case "ArrowDown":
                nextValue = this._extractValue(event.target.value);
                if (nextValue === null) {
                    this._reset(event);
                } else {
                    multiplier = key === "ArrowUp" ? 1 : -1;
                    multiplier *= event.shiftKey ? this.props.bigstep : 1;
                    increment = this.props.step * multiplier;
                    nextValue += increment;
                    this._commit(event, nextValue, true);
                }
                event.preventDefault();
                break;
            }

            if (this.props.onKeyDown) {
                this.props.onKeyDown(event);
            }
        },

        /**
         * Attempt to commit the current value, and call the external onBlur
         * handler.
         * 
         * @private
         * @param {SyntheticEvent} event
         */
        _handleBlur: function (event) {
            var nextValue = this._extractValue(event.target.value);
            if (nextValue === null) {
                this._reset(event);
            } else {
                this._commit(event, nextValue, true);
            }

            if (this.props.onBlur) {
                this.props.onBlur(event);
            }
        },

        render: function () {
            var size = this.props.size || "c-4-25";
            var className = React.addons.classSet({
                    "number-input__dirty" : this.state.dirty,
                    "number-input__clean" : !this.state.dirty
                });
            className += " " + size;
            return (
                <input
                    {...this.props}
                    type="text"
                    ref="input"
                    className={className}
                    value={this.state.rawValue}
                    onChange={this._handleChange}
                    onBlur={this._handleBlur}
                    onKeyDown={this._handleKeyDown}>
                </input>
            );
        }
    });

    module.exports = NumberInput;
});
