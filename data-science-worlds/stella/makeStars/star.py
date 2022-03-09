import math
import random

kSolarTemperature = 5800  # Kelvin
kGiantTemperature = 3333
maxStarLogMass = 1.5  # about 30 sols
minStarLogMass = -1.0  # 0.1 solar masses


class System(object):
    systemID = 0

    def __init__(self, iWhere, iMotion, iLogAge):
        System.systemID += 1
        self.sysID = System.systemID
        self.stars = []

        tWhither = dict(
            vx=random.normalvariate(iMotion["x"], iMotion["sx"]),
            vy=random.normalvariate(iMotion["y"], iMotion["sy"]),
            vr=random.normalvariate(iMotion["r"], iMotion["sr"])
        )

        self.logAge = iLogAge
        self.where = iWhere
        self.whither = tWhither

        # now make the stars

        s1 = Star(self)

        if random.random() < 0.4:
            s2 = Star(self)
            p = math.pi * 2 * random.random()
            s2.binPhase = p
            s1.binPhase = p + math.pi
            m1 = pow(10,s1.logMass) * 2.0e30    # in kg
            m2 = pow(10,s2.logMass) * 2.0e30
            r1 = 50 * random.random() * random.random()     # AU
            r1 *= 1.5e11        # now in meters
            r2 = r1 * (m1/m2)
            v1 = math.sqrt(
                (6.67e-11) * m2 * r1 / ((r1 + r2) * (r1 + r2))
            )  # meters per second
            v2 = v1 * (r2 / r1)
            # p1 = 2 * math.pi * r1 * (1.5e11) / v1 / (math.pi) / 1.0e07
            s1.binPeriod = r1 * (2.0e-07) / v1     # r1 in meters, v1 in mps. Result in years.
            s2.binPeriod = r2 * (2.0e-07) / v2
            s1.binAmplitude = v1 / 1000.0
            s2.binAmplitude = v2 / 1000.0

            self.stars.append(s2)

        self.stars.append(s1)


class Star(object):
    def __init__(self, iSystem):

        self.id = "foo"
        self.sysWhere = iSystem.where
        self.logAge = iSystem.logAge

        t1 = random.random()
        t2 = (1 - t1) * (1 - t1)

        #
        #   See the page in Evernote about this.
        #   This uses Boltzmann L ~ T^4 R^2
        #   these are all in SOLAR units except temperature which is Kelvins
        #
        self.logMass = (maxStarLogMass - minStarLogMass) * t2 + minStarLogMass
        self.logMSRadius = (2.0 / 3.0) * self.logMass
        self.logRadius = self.logMSRadius
        self.logLum = 3.5 * self.logMass
        self.logMSTemp = 3.76 + 13.0 / 24.0 * self.logMass  # 3.76 = log10(5800) the nominal Solar temp
        self.logTemp = self.logMSTemp
        self.logLifetime = 10 + self.logMass - self.logLum

        self.varPeriod = 0
        self.varPhase = random.uniform(0, 2 * math.pi)
        self.varAmplitude = 0

        self.binPeriod = 0
        self.binPhase = 0
        self.binAmplitude = 0

        self.evolve()

    def evolve(self):

        self.giant = self.giantIndex()

        oldLuminosity = self.logLum

        if self.giant <= 0:
            self.giant = 0

        elif self.giant <= 1.0:
            tTemp = math.pow(10, self.logTemp)
            tCurrentTemp = tTemp - self.giant * (tTemp - kGiantTemperature)  # linear
            tCurrentTemp -= random.random() * 500  # a little variability
            self.logTemp = math.log10(tCurrentTemp)
            self.logRadius = self.logMSRadius + 2.0 * (self.logMSTemp - self.logTemp)


        else:  # WD!
            self.logTemp = random.uniform(4.0, 4.5)
            #   todo: decide if the star lost mass
            self.logRadius = -2.0 - 0.3 * self.logMass

        tTempInSols = math.pow(10, self.logTemp) / kSolarTemperature
        self.logLum = 2 * self.logRadius + 4 * math.log10(tTempInSols)

        if 1 >= self.giant > 0:
            # logLum ranges from about 1 to 5
            periodNumber = (5.0 - self.logLum) / 4.0  # so about 0 to 1. more luminous = shorter period
            self.varPeriod = 0.1 + periodNumber * 0.5  # half-year max
            self.varAmplitude = 0.3 * self.giant  # proportion of luminosity

            print("{:4.2f} g {:6.2f} lum {:6.2f} per".format(self.giant, self.logLum, self.varPeriod))
            #   print "Old logL ", oldLuminosity, " new: ", self.logLum, " GI: ", self.giant

    def giantIndex(self):
        tAge = math.pow(10, self.logAge)
        tLife = math.pow(10, self.logLifetime)
        tAcross = tLife
        tGiant = tLife
        result = 0

        if (tAge < tLife):
            result = 0.0
        elif (tAge < tLife + tAcross):
            result = (tAge - tLife) / tAcross
        elif tAge < tLife + tAcross + tGiant:
            result = 1.0
        else:
            result = 1000.0

        return result


class Cluster(object):
    def __init__(self, iCenter, iOrigin, iSize, iAge, iAgeSpread):
        self.center = iCenter  # in parsecs
        self.origin = iOrigin  # coordinates of origin point in parsecs
        self.size = iSize  # SD in parsecs at current location
        self.age = iAge  # in log years
        self.ageSpread = iAgeSpread  # +/- spread in log years

    def oneStarCoordinates(self):
        where = dict(
            x=random.normalvariate(self.center["x"], self.size),
            y=random.normalvariate(self.center["y"], self.size),
            r=random.normalvariate(self.center["r"], self.size)
        )
        whither = dict(
            x=where["x"] - self.origin["x"],
            y=where["y"] - self.origin["y"],
            z=where["z"] - self.origin["z"]
        )

        return where, whither
