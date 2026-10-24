"""Original Manim animations for the LearningAI v7 proof laboratories.

Requires Manim Community Edition; not bundled with this offline website.
Example: manim -pql algorithm_design_v7_scenes.py HuffmanMergeScene
All sample data are independently authored.
"""
from manim import *

class LatenessExchangeScene(Scene):
    def construct(self):
        self.play(Write(Text('Earliest deadline: swap an inversion',font_size=30).to_edge(UP)))
        labels=[('A',3,7),('B',2,3),('C',4,9),('D',1,4)]
        jobs=VGroup(*[VGroup(RoundedRectangle(width=1.4,height=.75,corner_radius=.12,color=BLUE),Text(f'{n}: t={t}, d={d}',font_size=17)) for n,t,d in labels]).arrange(RIGHT,buff=.16)
        jobs.move_to(ORIGIN)
        self.play(Create(jobs))
        self.wait(.3)
        self.play(jobs.animate.arrange(RIGHT,buff=.16))
        ordered=['B','D','A','C'];new=VGroup(*[VGroup(RoundedRectangle(width=1.4,height=.75,corner_radius=.12,color=TEAL),Text(n,font_size=25)) for n in ordered]).arrange(RIGHT,buff=.16).move_to(DOWN*1.15)
        self.play(TransformFromCopy(jobs,new))
        self.play(Write(Text('Finish times: 2, 3, 6, 10   |   max lateness: +1',font_size=23).to_edge(DOWN)))
        self.wait(1)

class HuffmanMergeScene(Scene):
    def construct(self):
        self.play(Write(Text('Huffman: combine the two lightest',font_size=33).to_edge(UP)))
        stages=[([5,7,10,15],''),([10,12,15],'5 + 7 → 12'),([15,22],'10 + 12 → 22'),([37],'15 + 22 → 37')]
        blocks=None
        for counts,msg in stages:
            new=VGroup(*[VGroup(RoundedRectangle(width=1.2,height=.75,corner_radius=.1,color=PURPLE),Text(str(v),font_size=29)) for v in counts]).arrange(RIGHT,buff=.35).move_to(ORIGIN)
            if blocks is None:self.play(FadeIn(new))
            else:self.play(ReplacementTransform(blocks,new))
            blocks=new
            if msg:self.play(Write(Text(msg,font_size=22).next_to(new,DOWN,buff=.65)))
            self.wait(.35)
        self.play(Write(Text('Optimal weighted path length = 12 + 22 + 37 = 71',font_size=23).to_edge(DOWN)))
        self.wait(.8)

class FFTButterflyScene(Scene):
    def construct(self):
        title=Text('Radix-2 FFT: even and odd branches',font_size=31).to_edge(UP);self.play(Write(title))
        left=VGroup(*[Text(str(v),font_size=28) for v in [1,2,3,4]]).arrange(DOWN,buff=.43).to_edge(LEFT,buff=1.4)
        even=VGroup(Text('even = [1,3]',font_size=24),Text('odd = [2,4]',font_size=24)).arrange(DOWN,buff=1).move_to(ORIGIN)
        result=VGroup(*[Text(x,font_size=23) for x in ['10','−2 + 2i','−2','−2 − 2i']]).arrange(DOWN,buff=.5).to_edge(RIGHT,buff=.9)
        self.play(FadeIn(left));self.play(GrowArrow(Arrow(left.get_right(),even.get_left(),buff=.25)),FadeIn(even));self.wait(.3)
        self.play(GrowArrow(Arrow(even.get_right(),result.get_left(),buff=.25)),FadeIn(result));self.wait(.5)
        self.play(Write(Text('O(n log n) butterflies; zero-pad before linear convolution',font_size=21).to_edge(DOWN)))
        self.wait(1)

class ProjectCutScene(Scene):
    def construct(self):
        title=Text('Prerequisite closure as a minimum cut',font_size=30).to_edge(UP);self.play(Write(title))
        coords={'A':LEFT*2.3+UP*.9,'B':LEFT*2.3+DOWN*.9,'C':RIGHT*2.3+UP*.9,'D':RIGHT*2.3+DOWN*.9}
        nodes=VGroup(); circles={}
        for n,(v,sign) in {'A':(8,'+'),'B':(7,'+'),'C':(-6,''),'D':(-5,'')}.items():
            circles[n]=Circle(radius=.56,color=GREEN if v>0 else RED).move_to(coords[n]);nodes.add(circles[n],Text(n+f' {sign}{v}',font_size=19).move_to(coords[n]))
        self.play(FadeIn(nodes));arrows=VGroup()
        for a,b in [('A','C'),('B','C'),('B','D')]:arrows.add(Arrow(coords[a],coords[b],buff=.62,stroke_width=3))
        self.play(Create(arrows));self.wait(.4)
        self.play(Write(Text('Choose A,B ⇒ must also choose C,D',font_size=23).to_edge(DOWN)))
        self.wait(.4);self.play(Indicate(nodes,color=YELLOW))
        self.play(Write(Text('Net value = 8 + 7 − 6 − 5 = 4',font_size=24).shift(DOWN*2.5)))
        self.wait(1)
