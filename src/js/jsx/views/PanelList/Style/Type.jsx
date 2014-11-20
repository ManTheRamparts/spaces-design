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

    var React = require("react");

    var Gutter = require("jsx!js/jsx/shared/Gutter"),
        Label = require("jsx!js/jsx/shared/Label"),
        TextInput = require("jsx!js/jsx/shared/TextInput"),
        SplitButton = require("jsx!js/jsx/shared/SplitButton"),
        SplitButtonList = SplitButton.SplitButtonList,
        SplitButtonItem = SplitButton.SplitButtonItem,
        strings = require("i18n!nls/strings");

    var Type = React.createClass({
        _handleTypefaceChange: function (event, value) {
            // TODO
        },
        _handleWeightChange: function (event, value) {
            // TODO
        },
        _handleSizeChange: function (event, value) {
            // TODO
        },
        _handleLetterSpacingChange: function (event, value) {
            // TODO
        },
        _handleLineSpacingChange: function(event, value) {
            // TODO
        },
        render: function () {
            
            return (
                <div>
                    <header className="sub-header">
                        <h3>
                            {strings.STYLE.TYPE.TITLE}
                        </h3>
                        <div className="buttonCluster">
                            <button id="button-lorem-ipsum" ref="lorem" onClick={this._openLoremPanel}>ℒ</button>
                            <button id="button-glyphs" ref="glyphs" onClick={this._openGlyphsPanel}>æ</button>
                            <button className="button-settings"></button>
                        </div>
                    </header>

                    <ul>
                        <li className="formline" >
                            <Label>
                                {strings.STYLE.TYPE.TYPEFACE}
                            </Label>
                            <Gutter />
                            
                            <TextInput
                                valueType="combo"
                                ref="typeface"
                                onChange={this._handleTypefaceChange}
                            />
                            <Gutter />
                        </li>
                        
                        <li className="formline">
                            <Label>
                                {strings.STYLE.TYPE.WEIGHT}
                            </Label>
                            <Gutter />
                            <TextInput
                                valueType="combo"
                                ref="weight"
                                onChange={this._handleWeightChange}
                            />
                            <Gutter />
                        </li>

                        <li className="formline">
                            <Label>
                                Color here
                            </Label>
                            <Gutter />
                            <Label size="c-3-25">
                                {strings.STYLE.TYPE.SIZE}
                            </Label>
                            <Gutter />
                            <TextInput
                                valueType="simple" 
                                onChange={this._handleSizeChange}
                            />
                        </li>


                        <li className="formline">
                            <Label>
                                {strings.STYLE.TYPE.LETTER}
                            </Label>
                            <Gutter />
                            <TextInput
                                valueType="simple"
                                onChange={this._handleLetterSpacingChange}
                            />
                            <Gutter />
                            <Gutter />
                            <Gutter />
                            <Label size="c-3-25">
                                {strings.STYLE.TYPE.LINE}
                            </Label>
                            <Gutter />
                            <TextInput
                                valueType="simple"
                                onChange={this._handleLineSpacingChange}
                            />
                        </li>

                        <li className="formline">
                            <Label>
                                {strings.STYLE.TYPE.ALIGN}
                            </Label>
                            <Gutter />
                            <SplitButtonList>
                                <SplitButtonItem 
                                    id="text-left"
                                    selected={false}
                                    disabled={false}
                                    onClick={null} />
                                <SplitButtonItem 
                                    id="text-center"
                                    selected={false}
                                    disabled={false}
                                    onClick={null} />
                                <SplitButtonItem 
                                    id="text-right"
                                    selected={false}
                                    disabled={false}
                                    onClick={null} />
                                <SplitButtonItem 
                                    id="text-justified"
                                    selected={false}
                                    disabled={false}
                                    onClick={null} />
                            </SplitButtonList>
                        </li>
                    </ul>
                </div>
            );
        },

        _openGlyphsPanel: function (event) {
    
        },

        _openLoremPanel: function (event) {
        
        }
    });

    module.exports = Type;
});
