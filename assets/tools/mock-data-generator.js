/**
 * Mock Data Generator
 * Generate realistic mock data for testing and development
 */
(function() {
'use strict';

function init() {
    const generateBtn = document.getElementById('mdg-generate');
    const copyBtn = document.getElementById('mdg-copy');
    const countInput = document.getElementById('mdg-count');
    const formatSelect = document.getElementById('mdg-format');
    const outputEl = document.getElementById('mdg-output');
    const statsEl = document.getElementById('mdg-stats');
    const isEN = document.documentElement.lang === 'en';

    if (!generateBtn || !outputEl) return;

    const T = (zh, en) => isEN ? en : zh;

    const labels = {
        ready: T('选择字段和数量，点击生成', 'Select fields and count, click Generate'),
        generating: T('正在生成...', 'Generating...'),
        generated: (n, size) => T(`已生成 ${n} 条记录（约 ${size}）`, `Generated ${n} records (~${size})`),
        copied: T('已复制！', 'Copied!'),
        copyFail: T('复制失败', 'Copy failed'),
        empty: T('请至少选择一个字段', 'Select at least one field'),
    };

    if (statsEl) statsEl.textContent = labels.ready;

    const firstNames = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen','Charles','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle','Kenneth','Carol','Kevin','Amanda','Brian','Dorothy','George','Melissa','Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Helen','Nicholas','Amy','Eric','Angela','Jonathan','Shirley','Stephen','Anna','Larry','Brenda','Justin','Pamela','Scott','Emma','Brandon','Nicole','Benjamin','Helen','Samuel','Samantha','Raymond','Katherine','Gregory','Christine','Frank','Debra','Alexander','Rachel','Patrick','Carolyn','Tyler','Janet','Nathan','Catherine','Dennis','Maria','Jerry','Heather'];
    const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez'];
    const domains = ['gmail.com','outlook.com','yahoo.com','icloud.com','protonmail.com','example.com','test.org','demo.io','mail.com','fastmail.com'];
    const cities = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','Austin','San Jose','Jacksonville','Fort Worth','Columbus','Charlotte','Indianapolis','San Francisco','Seattle','Denver','Nashville','Portland','Memphis','Louisville','Baltimore','Milwaukee','Albuquerque','Tucson','Fresno','Sacramento','Mesa','Atlanta','Kansas City','Omaha','Colorado Springs','Raleigh','Long Beach','Virginia Beach','Miami','Oakland','Minneapolis','Tampa','New Orleans','Cleveland','Honolulu','Arlington','Lexington','Orlando','Stockton','Cincinnati','St. Louis','Pittsburgh','Greensboro','Anchorage','Plano','Lincoln','Riverside','Newark','Toledo','Durham','Chula Vista','Fort Wayne','Jersey City','St. Paul','Madison','Lubbock','Reno','Buffalo','Laredo','Lansing','Birmingham','Des Moines','Rochester','Richmond','Boise','Spokane','Montgomery','Provo','Modesto','Santa Clarita','Tacoma','Fontana','Fremont','Hayward','Lakewood','Santa Rosa','Irvine','Yonkers','Aurora','Anaheim','Pasadena','Winston-Salem','Huntsville','Norfolk','El Paso','Bakersfield','Santa Ana','Corpus Christi','New Haven','Escondido','Sunnyvale','Savannah','Fort Lauderdale','Grand Rapids','Brownsville','Cary','Knoxville','Columbia','Billings','Charleston','Gainesville','Tallahassee','Hollywood','Port St. Lucie','Cape Coral','Pembroke Pines','Peoria','Eugene','Salem'];
    const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
    const stateNames = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
    const streets = ['Main St','Oak Ave','Elm St','Park Ave','Maple Dr','Cedar Ln','Pine St','Washington Blvd','Lake Dr','Hill Rd','River Rd','Forest Ave','Spring St','Church St','Market St','Broadway','Highland Ave','Sunset Blvd','Lincoln Ave','Jefferson Ave','Madison Ave','Adams St','Franklin Ave','Hamilton Ave','Walnut St','Cherry St','Willow Ct','Birch St','Ash St','Cypress Ave','Sycamore Dr','Poplar St','Hickory Ln','Mulberry Ct','Spruce St','Beech St','Palm Ave','Mango St','Bay St','Harbor Dr','Ocean Ave','Mountain Rd','Valley Blvd','Meadow Ln','Garden St','Academy St','College Ave','School St','University Dr','Veterans Blvd','Victory Blvd','Liberty Ave','Union St','Heritage Dr','Crystal Ct','Golden Gate Ave','Silver Springs Blvd','Diamond St','Ruby Ln','Pearl St','Jade Ln','Copper Ct','Steel St','Iron Dr','Stone Way','Clay St','Gravel Ct','Sand Ave','Dusty Rd','Wildflower Ln','Butterfly Ct','Dragonfly Dr','Falcon Way','Eagle St','Hawk Ave','Raven Ct','Swan St','Robin Ln','Dove Ct','Sparrow Ave','Wren St','Blue Jay Dr','Cardinal Way','Owl Ct','Woodpecker St','Kingfisher Ln','Pelican Ave','Seagull Dr','Dolphin St','Whale Ave','Salmon Ct','Trout St','Bass Ave','Pike Dr','Coral St','Reef Ave','Tide Ct','Wave St','Surf Ave','Coastal Dr','Bayfront Ct','Lakeshore Dr','Riverside Ave','Brookside Ln','Creek Ct','Springs Rd','Falls Way','Cascade Ave','Summit Dr','Peak Ave','Mesa St','Canyon Rd','Ridge Ct','Bluff St','Glen Ave','Hollow Ct','Vale St','Prairie Dr','Plain Ave','Field Ct','Farm St','Orchard Ln','Vineyard Ave','Grove St','Thicket Ct','Woodland Dr','Forest Path','Jungle Ct','Safari Dr','Tiger Ln','Panda St','Koala Ave','Panda Ct','Bear St','Wolf Ave','Fox Ln','Otter Ct','Beaver Dr','Rabbit St','Deer Ave','Elk Ct','Moose St','Bison Dr','Buffalo Ave','Antelope St','Gazelle Ave','Cheetah Ct','Leopard St','Panther Dr','Lynx Ct','Bobcat Ave','Wildcat Ln','Cougar St','Mountain Lion Dr'];
    const companies = ['TechCorp','DataFlow','CloudNine','InnoSoft','PixelWorks','NexGen','BrightPath','Quantum','Stellar','Atlas','CoreBridge','Vanguard','Apex','Zenith','Pinnacle','Fusion','Pulse','Nova','Helix','Vertex','Crestline','Horizon','Summit','Pacific','Atlantic','Meridian','Equinox','Prism','Aether','Lumen','Cypher','Synapse','Matrix','Nexus','Grid','Forge','Foundry','Millworks','Craft','Blueprint','Archway','Cornerstone','Keystone','Titan','Aegis','Shield','Guardian','Sentinel','Patriot','Legacy','Heritage','Trademark','Brandcraft','MarketForce','SalesStream','RevenueGen','GrowthHive','ScaleUp','LaunchPad','RocketShip','AstroWorks','Orbit','SpaceLabs','Galaxy','Nebula','Comet','Meteor','TerraForm','GreenEarth','EcoWorks','BioGen','LifeScience','HealthPlus','MedCore','CareFirst','WellSpring','BrightMinds','LearnFast','EduPro','SkillCraft','ClassAct','BookWorm','WriteSpace','PageTurner','PaperTrail','InkWell','TypeSet','PrintHouse','DigitalFirst','WebCraft','NetSolutions','CodeBase','ByteWorks','BitStream','DataMine','InfoSight','Analytix','InsightPro','MetricHub','Dashboard','ReportGen','BaseCamp','Trek','PathFinder','GuidePost','Compass','NorthStar','LightHouse','Beacon','Signal','WaveLink','NetConnect','BridgeNet','LinkUp','ChainLink','TiePoint','Node','HubSpot','CenterPoint','CoreSys','MainFrame','PowerGrid','EnergyWorks','Solaris','WindForce','AquaFlow','HydroGen','TerraDyne','GeoScience','RockSolid','Granite','Marble','Onyx','Jade','Crystal','Ruby','Diamond','Platinum','GoldStar','SilverLine','BronzeAge','CopperField','IronClad','SteelWorks','Alloy','Composite','Polymer','FlexiCorp','Dynamic','AgileShift','SwiftMove','FastTrack','QuickStep','RapidRoute','ExpressLane','Transit','TravelWise','WanderLust','Voyager','Explorer','Pioneer','TrailBlazer','Adventurer','Nomad','GlobeTrotter','Passport','Journey','Quest','Odyssey','Saga','Epic','Legend','Mythic','Fable','StoryWeaver','TaleCraft','NovelIdeas','PlotPoint','SceneSet','ActOne','FinalCut','ReelTime','FilmWorks','StageCraft','DramaZone','ComedyLab','LaughTrack','SmileMaker','JoyRide','FunZone','PlayTime','GameWorks','SportCraft','FitLife','ActiveWear','MoveWell','Stride','Pace','StepUp','RunFast','JumpStart','PowerUp','ChargeOn','EnergyBoost','VitalForce','CorePower','StrongArm','IronWill','SteelResolve','DiamondMind','BrightSpark','GeniusLab','IdeaForge','ThinkTank','MindWorks','BrainStorm','Eureka','LightBulb','BrightIdea','InnovationLab','CreateLab','DesignWorks','StudioOne','ArtCraft','ColorSplash','PaintBox','SketchPad','DrawBridge','InkDrop','PixelArt','Canvas','FrameWork','ShapeShift','FormLab','Structure','Pattern','Weave','Texture','Tone','SoundWave','AudioLab','Echo','Resonance','Harmony','Melody','Rhythm','BeatBox','TuneCraft','NoteWorthy','Chord','Scale','KeyNote','Octave','Pitch','Tempo','RhythmWorks','DrumBeat','BassLine','Treble','Soprano','Alto','Tenor','Baritone','Bass','Solo','Duet','Trio','Quartet','Ensemble','Orchestra','Symphony','Philharmonic','Concert','Band','Group','Crew','Team','Squad','Unit','Force','Division','Corps','Brigade','Regiment','Battalion','Company','Platoon','Troop','Squadron','Fleet','Armada','Flotilla','TaskForce','StrikeForce','RapidResponse','QuickAction','FastReaction','SpeedDial','HotLine','DirectLine','Priority','Urgent','Critical','Essential','Core','Fundamental','Basic','Prime','Main','Major','Key','Central','Lead','Front','Head','Chief','Top','Peak','Max','Ultra','Super','Hyper','Mega','Giga','Tera','Peta','Exa','Zetta','Yotta'];
    const jobTitles = ['Software Engineer','Senior Developer','Product Manager','Data Scientist','UX Designer','DevOps Engineer','QA Engineer','Tech Lead','Engineering Manager','Frontend Developer','Backend Developer','Full Stack Developer','Cloud Architect','Security Analyst','Business Analyst','Project Manager','Scrum Master','Product Owner','Solution Architect','Database Administrator','Systems Administrator','Network Engineer','Data Analyst','Machine Learning Engineer','AI Researcher','Research Scientist','Content Strategist','Marketing Manager','SEO Specialist','Growth Hacker','Sales Representative','Account Executive','Customer Success Manager','Support Engineer','Technical Writer','Graphic Designer','Art Director','Creative Lead','Brand Manager','Financial Analyst','Operations Manager','HR Specialist','Recruiter','Training Coordinator','Compliance Officer','Legal Counsel','Communications Manager','Public Relations','Social Media Manager','Community Manager','Video Editor','Motion Designer','Photographer','Copywriter','Editor','Translator','Consultant','Advisor','Strategist','Director','VP of Engineering','CTO','CEO','CFO','COO','Chief Architect','Chief Data Officer','Chief Security Officer','Chief Product Officer','Chief Marketing Officer','Chief Revenue Officer','Chief Growth Officer','Chief Innovation Officer','Head of Design','Head of Product','Head of Engineering','Head of Sales','Head of Marketing','Head of Operations','Head of HR','Head of Finance','Head of Legal','Head of Communications','Team Lead','Chapter Lead','Guild Lead','Practice Lead','Principal Engineer','Fellow','Distinguished Engineer','Staff Engineer','Senior Staff Engineer','Principal Architect','Enterprise Architect','Technical Fellow','Research Fellow','Scientist','Senior Scientist','Lead Scientist','Principal Scientist','Chief Scientist'];

    function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function pick(arr) { return arr[rand(0, arr.length - 1)]; }

    function generateName() { return pick(firstNames) + ' ' + pick(lastNames); }
    function generateEmail(name) { return name.toLowerCase().replace(/\s+/g,'.') + rand(1,999) + '@' + pick(domains); }
    function generatePhone() { return '(' + rand(200,999) + ') ' + rand(100,999) + '-' + rand(1000,9999); }
    function generateAddress() { return rand(100,9999) + ' ' + pick(streets) + ', ' + pick(cities) + ', ' + pick(states) + ' ' + String(rand(10000,99999)); }
    function generateCompany() { return pick(companies) + ' ' + pick(['Inc','LLC','Corp','Ltd','Group']); }
    function generateJobTitle() { return pick(jobTitles); }
    function generateDate(start, end) { const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); return d.toISOString().split('T')[0]; }
    function generateId() { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let id = ''; for (let i = 0; i < 8; i++) id += chars[rand(0, chars.length - 1)]; return id; }
    function generateSSN() { return String(rand(100,999)) + '-' + String(rand(10,99)) + '-' + String(rand(1000,9999)); }
    function generateCreditCard() { let nums = []; for (let i = 0; i < 4; i++) nums.push(String(rand(1000,9999))); return nums.join('-'); }
    function generateURL() { return 'https://www.' + pick(companies).toLowerCase() + '.com'; }
    function generateIP() { return rand(10,223) + '.' + rand(0,255) + '.' + rand(0,255) + '.' + rand(1,254); }
    function generateLorem() { const words = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum','perspiciatis','unde','omnis','iste','natus','error','voluptatem','accusantium','doloremque','laudantium','totam','rem','aperiam','eaque','ipsa','quae','ab','illo','inventore','veritatis','quasi','architecto','beatae','vitae','dicta','explicabo','nemo','enim','ipsam','quia','voluptas','aspernatur','aut','odit','fugit','sed','quia','consequuntur','magni','dolores','eos','qui','ratione','voluptatem','sequi','nesciunt']; const count = rand(5,25); let result = []; for (let i = 0; i < count; i++) result.push(pick(words)); return result.join(' '); }
    function generateColor() { return '#' + ('000000' + rand(0,16777215).toString(16)).slice(-6); }

    const fieldGenerators = {
        name: { label: T('姓名', 'Name'), gen: () => generateName() },
        email: { label: T('邮箱', 'Email'), gen: (r) => generateEmail(r.name || generateName()) },
        phone: { label: T('电话', 'Phone'), gen: () => generatePhone() },
        address: { label: T('地址', 'Address'), gen: () => generateAddress() },
        company: { label: T('公司', 'Company'), gen: () => generateCompany() },
        jobTitle: { label: T('职位', 'Job Title'), gen: () => generateJobTitle() },
        dateOfBirth: { label: T('出生日期', 'DOB'), gen: () => generateDate(new Date('1950-01-01'), new Date('2005-12-31')) },
        id: { label: T('ID', 'ID'), gen: () => generateId() },
        ssn: { label: T('社保号', 'SSN'), gen: () => generateSSN() },
        creditCard: { label: T('信用卡', 'Credit Card'), gen: () => generateCreditCard() },
        url: { label: T('网址', 'URL'), gen: () => generateURL() },
        ip: { label: T('IP 地址', 'IP Address'), gen: () => generateIP() },
        color: { label: T('颜色', 'Color'), gen: () => generateColor() },
        salary: { label: T('薪资', 'Salary'), gen: () => rand(35000, 250000).toLocaleString() },
        description: { label: T('描述', 'Description'), gen: () => generateLorem() },
    };

    function getSelectedFields() {
        const selected = [];
        document.querySelectorAll('#mdg-fields input[type=checkbox]:checked').forEach(cb => {
            const val = cb.value;
            if (fieldGenerators[val]) selected.push(val);
        });
        return selected;
    }

    function generate() {
        const fields = getSelectedFields();
        if (fields.length === 0) {
            if (statsEl) statsEl.textContent = labels.empty;
            return;
        }
        const count = Math.min(Math.max(parseInt(countInput.value) || 10, 1), 1000);
        const format = formatSelect.value;
        if (statsEl) statsEl.textContent = labels.generating;

        const records = [];
        for (let i = 0; i < count; i++) {
            const record = {};
            const ctx = { name: null };
            fields.forEach(f => {
                const gen = fieldGenerators[f].gen;
                record[f] = gen(ctx);
            });
            records.push(record);
        }

        let output;
        if (format === 'json') {
            output = JSON.stringify(records, null, 2);
        } else if (format === 'csv') {
            const headers = fields.map(f => fieldGenerators[f].label);
            const lines = [headers.join(',')];
            records.forEach(r => {
                const row = fields.map(f => {
                    const val = String(r[f] || '');
                    return val.includes(',') || val.includes('"') ? '"' + val.replace(/"/g, '""') + '"' : val;
                });
                lines.push(row.join(','));
            });
            output = lines.join('\n');
        } else {
            // markdown table
            const headers = fields.map(f => fieldGenerators[f].label);
            const sep = fields.map(() => '---');
            const rows = [headers.join(' | '), sep.join(' | ')];
            records.forEach(r => {
                const row = fields.map(f => String(r[f] || ''));
                rows.push(row.join(' | '));
            });
            output = rows.join('\n');
        }

        outputEl.value = output;
        const size = (output.length / 1024).toFixed(1) + ' KB';
        if (statsEl) statsEl.textContent = labels.generated(count, size);
    }

    function copyResult() {
        if (!outputEl.value) return;
        navigator.clipboard.writeText(outputEl.value).then(() => {
            if (statsEl) statsEl.textContent = labels.copied;
        }).catch(() => {
            if (statsEl) statsEl.textContent = labels.copyFail;
        });
    }

    generateBtn.addEventListener('click', generate);
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    countInput.addEventListener('keydown', e => { if (e.key === 'Enter') generate(); });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();