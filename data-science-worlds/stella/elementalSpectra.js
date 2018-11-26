/**
 * Created by tim on 6/25/16.


 ==========================================================================
 elementalSpectra.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ==========================================================================


 */

/* global Spectrum, Line */

/**
 * Singleton containing spectra for each species in stellar atmospheres.
 * These are set so the maximum intensity is (about) 100.
 * So you will need to scale them to get the height that's appropriate.
 *
 * @type {{H: null, HeI: null, CaII: null, NaI: null, FeI: null, mainSequenceWidth: number, giantWidth: number, initialize: elementalSpectra.initialize}}
 */
var elementalSpectra = {
    H : null,
    HeI : null,
    LiI : null,
    CaII : null,
    NaI : null,
    FeI : null,
    mainSequenceWidth : 0.1,
    giantWidth : 0.03,

    /*
    To add a new species:
        Put the line values in here
        Refer to the lines in the definition above.
        Put the menu item in stella.html
        Put the element in stella.model.installDischargeTube()

     */

    initialize : function() {
        var tSpectrum, tWhat;

        //  Hydrogen
        tWhat = "H";
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   divide intensities by 5000
        tSpectrum.addLine(new Line(656.2771534, this.mainSequenceWidth, 100, tWhat ));
        tSpectrum.addLine(new Line(486.135, this.mainSequenceWidth, 36, tWhat ));
        tSpectrum.addLine(new Line(434.0472, this.mainSequenceWidth, 18, tWhat ));
        tSpectrum.addLine(new Line(410.1734, this.mainSequenceWidth, 14, tWhat ));
        tSpectrum.addLine(new Line(397.0075, this.mainSequenceWidth, 6, tWhat ));
        tSpectrum.addLine(new Line(388.9064, this.mainSequenceWidth, 14, tWhat ));
        elementalSpectra.H = tSpectrum;

        //  Helium
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   divide intensities by 5
        tWhat = "HeI";
        tSpectrum.addLine(new Line(381.96074, this.mainSequenceWidth, 2, tWhat ));
        tSpectrum.addLine(new Line(383.3554, this.mainSequenceWidth, 0.6, tWhat ));
        tSpectrum.addLine(new Line(387.1791, this.mainSequenceWidth, 0.2, tWhat ));
        tSpectrum.addLine(new Line(388.8648, this.mainSequenceWidth, 100, tWhat ));
        tSpectrum.addLine(new Line(396.47291, this.mainSequenceWidth, 4, tWhat ));
        tSpectrum.addLine(new Line(402.61914, this.mainSequenceWidth, 10, tWhat ));
        tSpectrum.addLine(new Line(412.08154, this.mainSequenceWidth, 2.4, tWhat ));
        tSpectrum.addLine(new Line(438.79296, this.mainSequenceWidth, 2, tWhat ));
        tSpectrum.addLine(new Line(447.14802, this.mainSequenceWidth, 40, tWhat ));
        tSpectrum.addLine(new Line(447.16832, this.mainSequenceWidth, 5, tWhat ));
        tSpectrum.addLine(new Line(471.31457, this.mainSequenceWidth, 6, tWhat ));
        tSpectrum.addLine(new Line(492.19313, this.mainSequenceWidth, 4, tWhat ));
        tSpectrum.addLine(new Line(501.56783, this.mainSequenceWidth, 20, tWhat ));
        tSpectrum.addLine(new Line(504.7738, this.mainSequenceWidth, 2, tWhat ));
        tSpectrum.addLine(new Line(587.5621, this.mainSequenceWidth, 100, tWhat ));
        tSpectrum.addLine(new Line(587.5966, this.mainSequenceWidth, 20, tWhat ));
        tSpectrum.addLine(new Line(667.8151, this.mainSequenceWidth, 20, tWhat ));
        elementalSpectra.HeI = tSpectrum;

        //  Lithium I (neutral. Not present in stellar atmospheres because it gets eaten.)
        tWhat = "LiI";
        tSpectrum = new Spectrum();     //  divide by 3600
        tSpectrum.addLine(new Line(670.7, this.mainSequenceWidth, 100, tWhat ));
        tSpectrum.addLine(new Line(610.3, this.mainSequenceWidth, 9, tWhat ));
        elementalSpectra.LiI = tSpectrum;


        //  Ca II (singly ionized)
        tWhat = "CaII";
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   divide intensities by 2.5
        tSpectrum.addLine(new Line(370.6024, this.mainSequenceWidth, 68, tWhat ));
        tSpectrum.addLine(new Line(373.6902, this.mainSequenceWidth, 72, tWhat ));
        tSpectrum.addLine(new Line(393.3663, this.mainSequenceWidth, 92, tWhat ));        //  K 3934
        tSpectrum.addLine(new Line(396.8469, this.mainSequenceWidth, 88, tWhat ));        //  H 3968

        tSpectrum.addLine(new Line(409.7098, this.mainSequenceWidth, 20, tWhat ));
        tSpectrum.addLine(new Line(410.9815, this.mainSequenceWidth, 24, tWhat ));
        tSpectrum.addLine(new Line(411.0282, this.mainSequenceWidth, 12, tWhat ));
        tSpectrum.addLine(new Line(420.6176, this.mainSequenceWidth, 16, tWhat ));
        tSpectrum.addLine(new Line(422.0071, this.mainSequenceWidth, 20, tWhat ));

        tSpectrum.addLine(new Line(500.1479, this.mainSequenceWidth, 28, tWhat ));
        tSpectrum.addLine(new Line(501.9971, this.mainSequenceWidth, 32, tWhat ));
        tSpectrum.addLine(new Line(502.1138, this.mainSequenceWidth, 16, tWhat ));
        tSpectrum.addLine(new Line(528.5266, this.mainSequenceWidth, 24, tWhat ));
        tSpectrum.addLine(new Line(530.7224, this.mainSequenceWidth, 28, tWhat ));

        tSpectrum.addLine(new Line(645.687, this.mainSequenceWidth, 32, tWhat ));

        elementalSpectra.CaII = tSpectrum;


        //  Na I (neutral)
        tWhat = "NaI";
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   only the D doublet :)
        tSpectrum.addLine(new Line(588.995, this.mainSequenceWidth, 100, tWhat ));
        tSpectrum.addLine(new Line(589.5924237, this.mainSequenceWidth, 50, tWhat ));     //  D
        elementalSpectra.NaI = tSpectrum;

        //  Fe I (neutral)
        tWhat = "FeI";
        tSpectrum = new Spectrum();

        tSpectrum.addLine(new Line(374.556, this.mainSequenceWidth, 100, tWhat ));	//	divide line intensity by 25,000
        tSpectrum.addLine(new Line(374.826, this.mainSequenceWidth, 76.4, tWhat ));
        tSpectrum.addLine(new Line(344.061, this.mainSequenceWidth, 54, tWhat ));
        tSpectrum.addLine(new Line(349.057, this.mainSequenceWidth, 52.8, tWhat ));
        tSpectrum.addLine(new Line(344.099, this.mainSequenceWidth, 51.6, tWhat ));
        tSpectrum.addLine(new Line(370.557, this.mainSequenceWidth, 51.6, tWhat ));
        tSpectrum.addLine(new Line(372.256, this.mainSequenceWidth, 51.6, tWhat ));
        tSpectrum.addLine(new Line(387.857, this.mainSequenceWidth, 51.6, tWhat ));
        tSpectrum.addLine(new Line(347.545, this.mainSequenceWidth, 48, tWhat ));
        tSpectrum.addLine(new Line(363.146, this.mainSequenceWidth, 46, tWhat ));
        tSpectrum.addLine(new Line(374.948, this.mainSequenceWidth, 46, tWhat ));
        tSpectrum.addLine(new Line(393.03, this.mainSequenceWidth, 46, tWhat ));
        tSpectrum.addLine(new Line(374.59, this.mainSequenceWidth, 44, tWhat ));
        tSpectrum.addLine(new Line(385.637, this.mainSequenceWidth, 44, tWhat ));
        tSpectrum.addLine(new Line(389.971, this.mainSequenceWidth, 42.8, tWhat ));
        tSpectrum.addLine(new Line(526.954, this.mainSequenceWidth, 40.8, tWhat ));
        tSpectrum.addLine(new Line(358.119, this.mainSequenceWidth, 40, tWhat ));
        tSpectrum.addLine(new Line(373.332, this.mainSequenceWidth, 40, tWhat ));
        tSpectrum.addLine(new Line(382.444, this.mainSequenceWidth, 40, tWhat ));
        tSpectrum.addLine(new Line(392.291, this.mainSequenceWidth, 40, tWhat ));
        tSpectrum.addLine(new Line(404.581, this.mainSequenceWidth, 40, tWhat ));
        tSpectrum.addLine(new Line(367.991, this.mainSequenceWidth, 36.4, tWhat ));
        tSpectrum.addLine(new Line(346.586, this.mainSequenceWidth, 34.8, tWhat ));
        tSpectrum.addLine(new Line(649.498, this.mainSequenceWidth, 34.8, tWhat ));
        tSpectrum.addLine(new Line(361.877, this.mainSequenceWidth, 33.2, tWhat ));
        tSpectrum.addLine(new Line(406.359, this.mainSequenceWidth, 33.2, tWhat ));
        tSpectrum.addLine(new Line(432.576, this.mainSequenceWidth, 33.2, tWhat ));
        tSpectrum.addLine(new Line(440.475, this.mainSequenceWidth, 32.4, tWhat ));
        tSpectrum.addLine(new Line(356.538, this.mainSequenceWidth, 30.4, tWhat ));
        tSpectrum.addLine(new Line(381.584, this.mainSequenceWidth, 30.4, tWhat ));
        tSpectrum.addLine(new Line(382.588, this.mainSequenceWidth, 30.4, tWhat ));
        tSpectrum.addLine(new Line(516.749, this.mainSequenceWidth, 30.4, tWhat ));
        tSpectrum.addLine(new Line(375.823, this.mainSequenceWidth, 29.6, tWhat ));
        tSpectrum.addLine(new Line(389.566, this.mainSequenceWidth, 29.6, tWhat ));
        tSpectrum.addLine(new Line(532.804, this.mainSequenceWidth, 29.6, tWhat ));
        tSpectrum.addLine(new Line(360.886, this.mainSequenceWidth, 28.8, tWhat ));
        tSpectrum.addLine(new Line(407.174, this.mainSequenceWidth, 28.4, tWhat ));
        tSpectrum.addLine(new Line(392.026, this.mainSequenceWidth, 26, tWhat ));
        tSpectrum.addLine(new Line(427.176, this.mainSequenceWidth, 25.2, tWhat ));
        tSpectrum.addLine(new Line(430.79, this.mainSequenceWidth, 25.2, tWhat ));
        tSpectrum.addLine(new Line(344.388, this.mainSequenceWidth, 24.8, tWhat ));
        tSpectrum.addLine(new Line(376.379, this.mainSequenceWidth, 23.6, tWhat ));
        tSpectrum.addLine(new Line(382.782, this.mainSequenceWidth, 23.6, tWhat ));
        tSpectrum.addLine(new Line(383.422, this.mainSequenceWidth, 23.6, tWhat ));
        tSpectrum.addLine(new Line(388.628, this.mainSequenceWidth, 22, tWhat ));
        tSpectrum.addLine(new Line(347.67, this.mainSequenceWidth, 19.6, tWhat ));
        tSpectrum.addLine(new Line(640, this.mainSequenceWidth, 19.6, tWhat ));
        tSpectrum.addLine(new Line(349.784, this.mainSequenceWidth, 19.16, tWhat ));
        tSpectrum.addLine(new Line(376.719, this.mainSequenceWidth, 18.28, tWhat ));
        tSpectrum.addLine(new Line(384.105, this.mainSequenceWidth, 18.28, tWhat ));
        tSpectrum.addLine(new Line(522.719, this.mainSequenceWidth, 17.48, tWhat ));
        tSpectrum.addLine(new Line(396.926, this.mainSequenceWidth, 17.08, tWhat ));
        tSpectrum.addLine(new Line(370.925, this.mainSequenceWidth, 15.92, tWhat ));
        tSpectrum.addLine(new Line(381.296, this.mainSequenceWidth, 15.92, tWhat ));
        tSpectrum.addLine(new Line(537.149, this.mainSequenceWidth, 15.56, tWhat ));
        tSpectrum.addLine(new Line(355.851, this.mainSequenceWidth, 15.2, tWhat ));
        tSpectrum.addLine(new Line(384.044, this.mainSequenceWidth, 15.2, tWhat ));
        tSpectrum.addLine(new Line(414.387, this.mainSequenceWidth, 14.52, tWhat ));
        tSpectrum.addLine(new Line(368.746, this.mainSequenceWidth, 14.2, tWhat ));
        tSpectrum.addLine(new Line(372.762, this.mainSequenceWidth, 14.2, tWhat ));
        tSpectrum.addLine(new Line(352.604, this.mainSequenceWidth, 13.56, tWhat ));
        tSpectrum.addLine(new Line(379.955, this.mainSequenceWidth, 12.64, tWhat ));
        tSpectrum.addLine(new Line(379.5, this.mainSequenceWidth, 12.36, tWhat ));
        tSpectrum.addLine(new Line(390.295, this.mainSequenceWidth, 12.08, tWhat ));
        tSpectrum.addLine(new Line(639.36, this.mainSequenceWidth, 12.08, tWhat ));
        tSpectrum.addLine(new Line(495.76, this.mainSequenceWidth, 11.8, tWhat ));
        tSpectrum.addLine(new Line(358.532, this.mainSequenceWidth, 11.52, tWhat ));
        tSpectrum.addLine(new Line(441.512, this.mainSequenceWidth, 11.52, tWhat ));
        tSpectrum.addLine(new Line(527.036, this.mainSequenceWidth, 11.52, tWhat ));
        tSpectrum.addLine(new Line(387.802, this.mainSequenceWidth, 11, tWhat ));
        tSpectrum.addLine(new Line(358.698, this.mainSequenceWidth, 10.76, tWhat ));
        tSpectrum.addLine(new Line(642.135, this.mainSequenceWidth, 10.28, tWhat ));
        tSpectrum.addLine(new Line(379.851, this.mainSequenceWidth, 10.04, tWhat ));
        tSpectrum.addLine(new Line(388.705, this.mainSequenceWidth, 10.04, tWhat ));
        tSpectrum.addLine(new Line(374.336, this.mainSequenceWidth, 9.8, tWhat ));
        tSpectrum.addLine(new Line(667.798, this.mainSequenceWidth, 9.6, tWhat ));
        tSpectrum.addLine(new Line(387.25, this.mainSequenceWidth, 9.36, tWhat ));
        tSpectrum.addLine(new Line(390.648, this.mainSequenceWidth, 9.36, tWhat ));
        tSpectrum.addLine(new Line(378.788, this.mainSequenceWidth, 8.96, tWhat ));
        tSpectrum.addLine(new Line(413.206, this.mainSequenceWidth, 8.96, tWhat ));
        tSpectrum.addLine(new Line(426.047, this.mainSequenceWidth, 8.96, tWhat ));
        tSpectrum.addLine(new Line(654.624, this.mainSequenceWidth, 8.96, tWhat ));
        tSpectrum.addLine(new Line(641.165, this.mainSequenceWidth, 8.76, tWhat ));
        tSpectrum.addLine(new Line(425.079, this.mainSequenceWidth, 8.56, tWhat ));
        tSpectrum.addLine(new Line(400.524, this.mainSequenceWidth, 8.36, tWhat ));
        tSpectrum.addLine(new Line(643.084, this.mainSequenceWidth, 8.36, tWhat ));
        tSpectrum.addLine(new Line(305.909, this.mainSequenceWidth, 8.16, tWhat ));
        tSpectrum.addLine(new Line(384.997, this.mainSequenceWidth, 8.16, tWhat ));
        tSpectrum.addLine(new Line(388.851, this.mainSequenceWidth, 8, tWhat ));
        tSpectrum.addLine(new Line(492.05, this.mainSequenceWidth, 7.8, tWhat ));
        tSpectrum.addLine(new Line(351.382, this.mainSequenceWidth, 7.64, tWhat ));
        tSpectrum.addLine(new Line(360.668, this.mainSequenceWidth, 7.64, tWhat ));
        tSpectrum.addLine(new Line(544.692, this.mainSequenceWidth, 7.28, tWhat ));
        tSpectrum.addLine(new Line(386.552, this.mainSequenceWidth, 7.12, tWhat ));
        tSpectrum.addLine(new Line(358.571, this.mainSequenceWidth, 6.64, tWhat ));
        tSpectrum.addLine(new Line(517.16, this.mainSequenceWidth, 6.48, tWhat ));
        tSpectrum.addLine(new Line(659.291, this.mainSequenceWidth, 6.2, tWhat ));
        tSpectrum.addLine(new Line(420.203, this.mainSequenceWidth, 5.92, tWhat ));
        tSpectrum.addLine(new Line(340.746, this.mainSequenceWidth, 5.8, tWhat ));
        tSpectrum.addLine(new Line(540.577, this.mainSequenceWidth, 5.8, tWhat ));
        tSpectrum.addLine(new Line(542.97, this.mainSequenceWidth, 5.8, tWhat ));
        tSpectrum.addLine(new Line(438.354, this.mainSequenceWidth, 5.64, tWhat ));
        tSpectrum.addLine(new Line(342.712, this.mainSequenceWidth, 5.52, tWhat ));
        tSpectrum.addLine(new Line(357.025, this.mainSequenceWidth, 5.52, tWhat ));
        tSpectrum.addLine(new Line(437.593, this.mainSequenceWidth, 5.52, tWhat ));
        tSpectrum.addLine(new Line(539.713, this.mainSequenceWidth, 5.28, tWhat ));
        tSpectrum.addLine(new Line(302.403, this.mainSequenceWidth, 4.92, tWhat ));
        tSpectrum.addLine(new Line(523.294, this.mainSequenceWidth, 4.92, tWhat ));
        tSpectrum.addLine(new Line(302.584, this.mainSequenceWidth, 4.8, tWhat ));
        tSpectrum.addLine(new Line(305.745, this.mainSequenceWidth, 4.8, tWhat ));
        tSpectrum.addLine(new Line(379.009, this.mainSequenceWidth, 4.8, tWhat ));
        tSpectrum.addLine(new Line(376.005, this.mainSequenceWidth, 4.68, tWhat ));
        tSpectrum.addLine(new Line(442.731, this.mainSequenceWidth, 4.68, tWhat ));
        tSpectrum.addLine(new Line(489.149, this.mainSequenceWidth, 4.68, tWhat ));
        tSpectrum.addLine(new Line(376.554, this.mainSequenceWidth, 4.6, tWhat ));
        tSpectrum.addLine(new Line(545.561, this.mainSequenceWidth, 4.6, tWhat ));
        tSpectrum.addLine(new Line(355.492, this.mainSequenceWidth, 4.4, tWhat ));
        tSpectrum.addLine(new Line(302.049, this.mainSequenceWidth, 4.28, tWhat ));
        tSpectrum.addLine(new Line(543.452, this.mainSequenceWidth, 4.28, tWhat ));
        tSpectrum.addLine(new Line(532.853, this.mainSequenceWidth, 4.2, tWhat ));
        tSpectrum.addLine(new Line(352.617, this.mainSequenceWidth, 4, tWhat ));
        tSpectrum.addLine(new Line(303.739, this.mainSequenceWidth, 3.92, tWhat ));
        tSpectrum.addLine(new Line(370.792, this.mainSequenceWidth, 3.72, tWhat ));
        tSpectrum.addLine(new Line(385.082, this.mainSequenceWidth, 3.64, tWhat ));
        tSpectrum.addLine(new Line(423.594, this.mainSequenceWidth, 3.56, tWhat ));
        tSpectrum.addLine(new Line(428.24, this.mainSequenceWidth, 3.56, tWhat ));
        tSpectrum.addLine(new Line(319.323, this.mainSequenceWidth, 3.48, tWhat ));
        tSpectrum.addLine(new Line(365.147, this.mainSequenceWidth, 3.48, tWhat ));
        tSpectrum.addLine(new Line(427.115, this.mainSequenceWidth, 3.48, tWhat ));
        tSpectrum.addLine(new Line(300.814, this.mainSequenceWidth, 3.4, tWhat ));
        tSpectrum.addLine(new Line(362.146, this.mainSequenceWidth, 3.4, tWhat ));
        tSpectrum.addLine(new Line(364.951, this.mainSequenceWidth, 3.4, tWhat ));
        tSpectrum.addLine(new Line(300.095, this.mainSequenceWidth, 3.24, tWhat ));
        tSpectrum.addLine(new Line(370.782, this.mainSequenceWidth, 3.24, tWhat ));
        tSpectrum.addLine(new Line(385.921, this.mainSequenceWidth, 3.24, tWhat ));
        tSpectrum.addLine(new Line(534.102, this.mainSequenceWidth, 3.24, tWhat ));
        tSpectrum.addLine(new Line(378.595, this.mainSequenceWidth, 3.16, tWhat ));
        tSpectrum.addLine(new Line(532.418, this.mainSequenceWidth, 3.12, tWhat ));
        tSpectrum.addLine(new Line(399.739, this.mainSequenceWidth, 3.04, tWhat ));
        tSpectrum.addLine(new Line(373.24, this.mainSequenceWidth, 2.96, tWhat ));
        tSpectrum.addLine(new Line(446.165, this.mainSequenceWidth, 2.96, tWhat ));
        tSpectrum.addLine(new Line(640.802, this.mainSequenceWidth, 2.96, tWhat ));
        tSpectrum.addLine(new Line(519.494, this.mainSequenceWidth, 2.88, tWhat ));
        tSpectrum.addLine(new Line(425.012, this.mainSequenceWidth, 2.84, tWhat ));
        tSpectrum.addLine(new Line(659.387, this.mainSequenceWidth, 2.84, tWhat ));
        tSpectrum.addLine(new Line(491.899, this.mainSequenceWidth, 2.76, tWhat ));
        tSpectrum.addLine(new Line(306.724, this.mainSequenceWidth, 2.72, tWhat ));
        tSpectrum.addLine(new Line(360.545, this.mainSequenceWidth, 2.72, tWhat ));
        tSpectrum.addLine(new Line(364.039, this.mainSequenceWidth, 2.72, tWhat ));
        tSpectrum.addLine(new Line(322.579, this.mainSequenceWidth, 2.64, tWhat ));
        tSpectrum.addLine(new Line(495.73, this.mainSequenceWidth, 2.64, tWhat ));
        tSpectrum.addLine(new Line(382.118, this.mainSequenceWidth, 2.6, tWhat ));
        tSpectrum.addLine(new Line(452.861, this.mainSequenceWidth, 2.6, tWhat ));
        tSpectrum.addLine(new Line(501.207, this.mainSequenceWidth, 2.6, tWhat ));
        tSpectrum.addLine(new Line(633.682, this.mainSequenceWidth, 2.6, tWhat ));
        tSpectrum.addLine(new Line(387.376, this.mainSequenceWidth, 2.52, tWhat ));
        tSpectrum.addLine(new Line(414.341, this.mainSequenceWidth, 2.52, tWhat ));
        tSpectrum.addLine(new Line(487.132, this.mainSequenceWidth, 2.52, tWhat ));
        tSpectrum.addLine(new Line(666.344, this.mainSequenceWidth, 2.52, tWhat ));
        tSpectrum.addLine(new Line(341.313, this.mainSequenceWidth, 2.48, tWhat ));
        tSpectrum.addLine(new Line(358.466, this.mainSequenceWidth, 2.48, tWhat ));
        tSpectrum.addLine(new Line(368.305, this.mainSequenceWidth, 2.48, tWhat ));
        tSpectrum.addLine(new Line(431.508, this.mainSequenceWidth, 2.48, tWhat ));
        tSpectrum.addLine(new Line(354.108, this.mainSequenceWidth, 2.4, tWhat ));
        tSpectrum.addLine(new Line(379.434, this.mainSequenceWidth, 2.4, tWhat ));
        tSpectrum.addLine(new Line(300.728, this.mainSequenceWidth, 2.32, tWhat ));
        tSpectrum.addLine(new Line(367.763, this.mainSequenceWidth, 2.32, tWhat ));
        tSpectrum.addLine(new Line(429.412, this.mainSequenceWidth, 2.32, tWhat ));
        tSpectrum.addLine(new Line(489.075, this.mainSequenceWidth, 2.32, tWhat ));
        tSpectrum.addLine(new Line(521.627, this.mainSequenceWidth, 2.32, tWhat ));
        tSpectrum.addLine(new Line(361.016, this.mainSequenceWidth, 2.24, tWhat ));
        tSpectrum.addLine(new Line(504.176, this.mainSequenceWidth, 2.24, tWhat ));
        tSpectrum.addLine(new Line(362.2, this.mainSequenceWidth, 2.16, tWhat ));
        tSpectrum.addLine(new Line(421.618, this.mainSequenceWidth, 2.16, tWhat ));
        tSpectrum.addLine(new Line(422.743, this.mainSequenceWidth, 2.16, tWhat ));
        tSpectrum.addLine(new Line(300.957, this.mainSequenceWidth, 2.08, tWhat ));
        tSpectrum.addLine(new Line(354.208, this.mainSequenceWidth, 2.08, tWhat ));
        tSpectrum.addLine(new Line(418.779, this.mainSequenceWidth, 2.08, tWhat ));
        tSpectrum.addLine(new Line(675.015, this.mainSequenceWidth, 2.08, tWhat ));
        tSpectrum.addLine(new Line(328.675, this.mainSequenceWidth, 2.04, tWhat ));
        tSpectrum.addLine(new Line(526.655, this.mainSequenceWidth, 2.04, tWhat ));
        tSpectrum.addLine(new Line(633.533, this.mainSequenceWidth, 2.04, tWhat ));
        tSpectrum.addLine(new Line(358.611, this.mainSequenceWidth, 2, tWhat ));
        tSpectrum.addLine(new Line(362.319, this.mainSequenceWidth, 2, tWhat ));
        tSpectrum.addLine(new Line(384.326, this.mainSequenceWidth, 2, tWhat ));

        elementalSpectra.FeI = tSpectrum;
    }
};
