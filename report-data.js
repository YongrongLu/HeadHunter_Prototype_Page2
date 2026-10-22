/* Deterministic, fictional assessment fixtures. No real applicant evaluation occurs. */
window.ReportData = (() => {
  const dimensions = [
    {id:'technical',title:'Technical capabilities',subtitle:'Tools, implementation, and engineering depth',labels:['Java','Python','AI models','System design','Testing'],color:'#72352f'},
    {id:'style',title:'Work style',subtitle:'Workplace behaviors illustrated in the interview',labels:['Initiative','Adaptability','Ownership','Learning drive','Organization'],color:'#ad6e38'},
    {id:'team',title:'Team collaboration',subtitle:'How the applicant works with other people',labels:['Feedback','Knowledge sharing','Conflict handling','Reliability','Team alignment'],color:'#367e7a'},
    {id:'thinking',title:'Communication & problem solving',subtitle:'How the applicant explains and works through problems',labels:['Clarity','Structured thinking','Trade-off reasoning','Active listening','Requirements'],color:'#72649a'},
    {id:'delivery',title:'Execution & ownership',subtitle:'Turning commitments into independently delivered work',labels:['Independent delivery','Prioritization','Follow-through','Quality judgment','Progress reporting'],color:'#9b6b56'}
  ];
  const candidates = [
    {id:'alex',name:'Alex Morgan',initials:'AM',color:'#783d35',years:'5 years',headline:'Balanced engineer with clear technical ownership.',traits:['Takes initiative','Structured thinker','Knowledge sharer'],technical:[92,86,82,89,88],style:[92,84,94,88,90],team:[88,94,82,92,91],thinking:[91,92,90,85,89],strength:'Connects technical decisions to a clear result and explains personal ownership.',followup:'Ask for a deeper example of evaluating model quality after deployment.'},
    {id:'priya',name:'Priya Shah',initials:'PS',color:'#3f817d',years:'4 years',headline:'Strong AI and Python depth with a curious working style.',traits:['Curious learner','Analytical','Open to feedback'],technical:[76,96,94,83,85],style:[88,94,85,97,81],team:[95,88,80,87,89],thinking:[86,94,93,89,87],strength:'Explains model selection, evaluation, and the limitations of results in concrete terms.',followup:'Explore Java service ownership and how she organizes competing delivery priorities.'},
    {id:'jordan',name:'Jordan Lee',initials:'JL',color:'#b77b42',years:'6 years',headline:'Dependable collaborator with strong engineering fundamentals.',traits:['Team oriented','Dependable','Patient listener'],technical:[88,80,73,93,95],style:[80,85,93,82,96],team:[93,90,95,97,96],thinking:[90,86,88,96,94],strength:'Gives specific examples of handling disagreements and maintaining shared delivery standards.',followup:'Clarify hands-on experience with modern AI model evaluation.'},
    {id:'sofia',name:'Sofia Chen',initials:'SC',color:'#8972a4',years:'3 years',headline:'Adaptable builder who learns new tools quickly.',traits:['Adaptable','Proactive','Creative problem solver'],technical:[72,90,88,78,79],style:[95,97,83,96,76],team:[88,86,78,84,90],thinking:[85,89,87,82,83],strength:'Describes iterative experiments and how new information changes implementation choices.',followup:'Probe testing discipline and ownership of longer-term system maintenance.'},
    {id:'marcus',name:'Marcus Reed',initials:'MR',color:'#5c819e',years:'7 years',headline:'Experienced Java engineer with a methodical delivery style.',traits:['Methodical','Accountable','Detail oriented'],technical:[97,74,65,95,94],style:[84,76,97,79,95],team:[81,87,86,96,88],thinking:[88,95,94,83,92],strength:'Explains system trade-offs, operational reliability, and personal responsibility clearly.',followup:'Explore AI fundamentals and how he adapts when the technical direction changes.'},
    {id:'emma',name:'Emma Wilson',initials:'EW',color:'#ba6f7c',years:'4 years',headline:'Clear communicator who builds alignment across teams.',traits:['Empathetic','Collaborative','Clear communicator'],technical:[78,84,79,80,86],style:[86,91,90,87,92],team:[97,94,96,93,98],thinking:[98,87,84,97,96],strength:'Turns ambiguous requests into shared requirements and brings others into the discussion.',followup:'Ask for a detailed walkthrough of a difficult implementation she personally owned.'},
    {id:'daniel',name:'Daniel Park',initials:'DP',color:'#81935e',years:'2 years',headline:'Promising AI practitioner with a strong learning mindset.',traits:['Eager to learn','Experimental','Reflective'],technical:[65,91,92,70,72],style:[89,92,75,98,73],team:[89,78,72,81,84],thinking:[79,86,80,85,76],strength:'Discusses model experiments openly, including unsuccessful attempts and lessons learned.',followup:'Confirm production experience, testing habits, and independent delivery scope.'},
    {id:'olivia',name:'Olivia Brooks',initials:'OB',color:'#a48b66',years:'5 years',headline:'Organized engineer who values reliability and shared knowledge.',traits:['Organized','Thoughtful','Reliable teammate'],technical:[85,82,76,88,92],style:[79,83,92,85,98],team:[92,96,88,95,94],thinking:[92,90,89,94,95],strength:'Connects documentation, testing, and collaboration to predictable project delivery.',followup:'Explore more advanced model evaluation and willingness to take the lead under ambiguity.'}
  ];
  const additionalScores = {
    alex:{delivery:[94,91,93,90,92]},
    priya:{delivery:[85,82,87,88,84]},
    jordan:{delivery:[93,95,98,97,96]},
    sofia:{delivery:[82,75,81,78,86]},
    marcus:{delivery:[98,94,97,96,93]},
    emma:{delivery:[87,96,94,90,99]},
    daniel:{delivery:[72,70,78,76,80]},
    olivia:{delivery:[92,98,97,96,98]}
  };
  candidates.forEach(c=>Object.assign(c,additionalScores[c.id]));
  const mean = xs => Math.round(xs.reduce((a,b)=>a+b,0)/xs.length);
  const roles = {
    ai:{title:'AI Software Engineer',metrics:[['java','Java proficiency','technical',0],['python','Python proficiency','technical',1],['ai','AI model understanding','technical',2],['style','Work style','people','style'],['team','Team collaboration','people','team'],['thinking','Communication & problem solving','people','thinking']]},
    fe:{title:'Senior Frontend Engineer',technicalLabels:['JavaScript / TS','React','Accessibility','API integration','Testing'],metrics:[['java','JavaScript / TypeScript','technical',0],['python','React proficiency','technical',1],['ai','Accessibility understanding','technical',2],['style','Work style','people','style'],['team','Team collaboration','people','team'],['thinking','Communication & problem solving','people','thinking']]},
    de:{title:'Data Engineer',technicalLabels:['SQL / modeling','Python','ETL / orchestration','Cloud platforms','Data quality'],metrics:[['java','SQL & data modeling','technical',0],['python','Python proficiency','technical',1],['ai','ETL / orchestration','technical',2],['style','Work style','people','style'],['team','Team collaboration','people','team'],['thinking','Communication & problem solving','people','thinking']]}
  };
  Object.values(roles).forEach(r=>r.metrics.push(
    ['ownership','Independent delivery','delivery',['delivery',0]],
    ['prioritization','Prioritization','delivery',['delivery',1]]
  ));
  const categories={technical:'TECHNICAL COMPETENCY',people:'PEOPLE & THINKING',delivery:'EXECUTION & OWNERSHIP'};
  const score=(c,m)=>Array.isArray(m[3])?c[m[3][0]][m[3][1]]:typeof m[3]==='number'?c.technical[m[3]]:mean(c[m[3]]);
  return {dimensions,candidates,roles,categories,mean,score};
})();
