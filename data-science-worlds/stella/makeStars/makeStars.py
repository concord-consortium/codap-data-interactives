import json
import math
import random
import jsonpickle

from star import *

kUniverseWidth = 5.00  # a square this many degrees on a side


def randomLocationInFrustum(iF):
    L1 = iF["L1"]
    L2 = iF["L2"]
    tDcubed = math.pow(L1, 3) + random.random() * (math.pow(L2, 3) - math.pow(L1, 3))
    tWhere = dict(
        x=iF["xMin"] + random.random() * iF["width"],
        y=iF["xMin"] + random.random() * iF["width"],
        r=math.pow(tDcubed, 0.333)
    )
    return tWhere


def randomLocationInCluster(iCenter, iSize):
    # remember that iCenter's x and y are in degrees and r is in parsecs

    x = y = -1

    #   find location in "parsec" coordinates

    while x < 0 or y < 0 or x > kUniverseWidth or y > kUniverseWidth:
        xPC = random.normalvariate(iCenter["x"] * iCenter["r"] * math.pi / 180.0, iSize)
        yPC = random.normalvariate(iCenter["y"] * iCenter["r"] * math.pi / 180.0, iSize)
        rPC = random.normalvariate(iCenter["r"], iSize)
        distance = math.sqrt(xPC * xPC + yPC * yPC + rPC * rPC)

        #   convert back to degrees for x and y, use small-angle
        x = (xPC / distance) * 180.0 / math.pi
        y = (yPC / distance) * 180.0 / math.pi

    return dict(
        x=x,
        y=y,
        r=rPC
    )


#
#   code begins here
#

stars = []
systems = []

universeDistance = 250.00  # end of the frustum

pMiddleClusterSizePC = 2
pMiddleClusterDistancePC = 47
pMiddleClusterLogAge = 8.7  # 800 mYr

pFarClusterSizePC = 1
pFarClusterDistancePC = 240
pFarClusterLogAge = 6.9  # under 10 MYr

kBackgroundStars = 640  # 80
kNearStars = 30  # 20
kMiddleStars = 80  # 50
kFarStars = 60  # 80

#
#   background stars
#


tFrustum = {
    "xMin": 0,
    "yMin": 0,
    "width": kUniverseWidth,
    "L1": 0,
    "L2": universeDistance
}

tMotion = {
    "x": 0, "sx": 25,
    "y": 0, "sy": 25,
    "r": 5, "sr": 25
}

for i in range(kBackgroundStars):
    tWhere = randomLocationInFrustum(tFrustum)
    tAge = random.uniform(5.0e08, 5.0e09)
    tSys = System(tWhere, tMotion, math.log10(tAge))
    for s in tSys.stars:  # returns a system
        stars.append(s)

    systems.append(tSys)

#
#   near stars. Our cluster.
#

tFrustum = {
    "xMin": 0,
    "yMin": 0,
    "width": kUniverseWidth,
    "L1": 0,
    "L2": universeDistance / 12  # because they're near :)
}

tMotion = {
    "x": 0, "sx": 5,
    "y": 0, "sy": 5,
    "r": 0, "sr": 5
}

for i in range(kNearStars):
    tWhere = randomLocationInFrustum(tFrustum)
    tSys = System(tWhere, tMotion, random.uniform(8.9, 9.3))
    for s in tSys.stars:  # returns a system
        stars.append(s)
    systems.append(tSys)

#
#   middle cluster
#

tMotion = dict(x=-20, y=-2, r=-5, sx=4, sy=4, sr=2)
tClusterCenter = dict(
    x=random.uniform(0.2, 0.4) * kUniverseWidth,
    y=random.uniform(0.2, 0.4) * kUniverseWidth,
    r=pMiddleClusterDistancePC
)

print ("Middle cluster: ", tClusterCenter)

for i in range(kMiddleStars):
    tWhere = randomLocationInCluster(tClusterCenter, pMiddleClusterSizePC)
    tSys = System(tWhere,
                  tMotion,
                  random.uniform(pMiddleClusterLogAge - 0.1, pMiddleClusterLogAge + 0.1))
    for s in tSys.stars:  # returns a system
        stars.append(s)
    systems.append(tSys)

#
#   far cluster
#

tMotion = dict(x=-20, y=40, r=25, sx=7, sy=7, sr=7)
tClusterCenter = dict(
    x=random.uniform(0.6, 0.8) * kUniverseWidth,
    y=random.uniform(0.6, 0.8) * kUniverseWidth,
    r=pFarClusterDistancePC + random.uniform(-5, 10)
)

print ("Far cluster: ", tClusterCenter)

for i in range(kFarStars):
    tWhere = randomLocationInCluster(tClusterCenter, pFarClusterSizePC)
    tSys = System(tWhere,
                  tMotion,
                  random.uniform(pFarClusterLogAge - 0.1, pFarClusterLogAge + 0.1))
    for s in tSys.stars:
        stars.append(s)
    systems.append(tSys)


#
#   sort by brightness
#

def sortByMagnitude(iStar):
    return 2 * math.log10(iStar.sysWhere["r"]) - iStar.logLum


def sort_systems(iSys):
    d = iSys.where["r"]
    lumsum = pow(10, iSys.stars[0].logLum)
    if len(iSys.stars) > 1:
        lumsum += pow(10, iSys.stars[1].logLum)
    return -(lumsum) / d / d


sortedStars = sorted(stars, key=sortByMagnitude)
sortedSystems = sorted(systems, key=sort_systems)

#
#   give the stars ids
#

nID = 1000
for s in sortedStars:
    nID += 1
    stringID = "A" + str(nID)
    s.id = stringID

nID = 100
for s in sortedSystems:
    nID += 1
    stringID = "S" + str(nID)
    s.sysID = stringID

#
#   output the json
#

jsonpickle.set_encoder_options('simplejson', sort_keys=True, indent=4)

f = open('staticStars.js', 'w')
f.write("stella.initialStarData = [\n")

for s in sortedSystems:  # sortedStars:
    thisSerializedSystem = jsonpickle.encode(s)  # Serializer.serialize(s)
    f.write(thisSerializedSystem + ",\n")

f.write("]")
f.close()

g = open('fathomStars.csv', 'w')
g.write('sysID, id, d, logM, logR, logA, T, logLum, GI\n')

for sy in sortedSystems:
    for st in sy.stars:
        g.write("{},{},{},{},{},{},{},{},{}\n".format(
            sy.sysID,
            st.id,
            st.sysWhere["r"],
            st.logMass,
            st.logRadius,
            sy.logAge,
            pow(10, st.logTemp),
            st.logLum,
            st.giant
        )
        )
g.close()
