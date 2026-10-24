"""LearningAI original statistical-learning Manim scenes.

Source topics: James et al., An Introduction to Statistical Learning (R edition),
Chapters 2, 4, 5, and 6. Animation designs and numerical parameters are
independent teaching examples; neither publisher plots nor dataset values copied.

Render after installing Manim Community, LaTeX and FFmpeg:
    manim -pql video/manim/islr_scenes.py BiasVarianceTeaching
    manim -pql video/manim/islr_scenes.py FiveFoldTeaching
    manim -pql video/manim/islr_scenes.py LogisticTeaching
    manim -pql video/manim/islr_scenes.py RegularizationTeaching
"""
from manim import *
import numpy as np


class BiasVarianceTeaching(Scene):
    def construct(self):
        title=Text('Flexibility versus expected error', font_size=32).to_edge(UP)
        axes=Axes(x_range=[1,10,1],y_range=[0,2.4,.4],x_length=9,y_length=4.4,axis_config={'include_numbers':True}).shift(DOWN*.45)
        xlabel=Text('Model complexity',font_size=20).next_to(axes,DOWN)
        ylabel=Text('MSE (toy units)',font_size=18).rotate(PI/2).next_to(axes,LEFT)
        train=axes.plot(lambda x:.19+1.65/(x+.1),x_range=[1,10],color=BLUE)
        test=axes.plot(lambda x:1.5/((x+.2)**2)+.017*(x-1)**2+.28,x_range=[1,10],color=ORANGE)
        self.play(Write(title),Create(axes),FadeIn(xlabel),FadeIn(ylabel))
        self.play(Create(train),Create(test),run_time=2)
        legend=VGroup(Text('Training',font_size=21,color=BLUE),Text('Expected test',font_size=21,color=ORANGE)).arrange(RIGHT,buff=.5).next_to(title,DOWN)
        self.play(FadeIn(legend))
        pointer=ValueTracker(1)
        point=always_redraw(lambda:Dot(axes.c2p(pointer.get_value(),1.5/((pointer.get_value()+.2)**2)+.017*(pointer.get_value()-1)**2+.28),color=RED,radius=.11))
        self.add(point);self.play(pointer.animate.set_value(9),run_time=4,rate_func=linear)
        self.wait(1)


class FiveFoldTeaching(Scene):
    def construct(self):
        title=Text('Five-fold cross-validation',font_size=32).to_edge(UP)
        explain=Text('Each observation validates exactly once',font_size=21).next_to(title,DOWN)
        self.play(Write(title),FadeIn(explain))
        box_w=.42;gap=.07
        rows=VGroup()
        for k in range(5):
            cells=VGroup(*[Rectangle(width=box_w,height=.42,fill_opacity=1,fill_color=ORANGE if j//4==k else BLUE,stroke_width=0) for j in range(20)])
            cells.arrange(RIGHT,buff=gap)
            row=VGroup(Text(f'Fit {k+1}',font_size=19),cells).arrange(RIGHT,buff=.35)
            rows.add(row)
        rows.arrange(DOWN,buff=.32).scale(.72).move_to(ORIGIN)
        for row in rows:self.play(FadeIn(row),run_time=.65)
        legend=VGroup(Text('Blue = train',color=BLUE,font_size=18),Text('Orange = validate',color=ORANGE,font_size=18)).arrange(RIGHT,buff=.6).next_to(rows,DOWN,buff=.45)
        self.play(FadeIn(legend));self.wait(1)


class LogisticTeaching(Scene):
    def construct(self):
        title=Text('Logistic prediction is a probability',font_size=29).to_edge(UP)
        axes=Axes(x_range=[0,10,1],y_range=[0,1,.2],x_length=9,y_length=4,axis_config={'include_numbers':True}).shift(DOWN*.4)
        slope=ValueTracker(.2)
        curve=always_redraw(lambda:axes.plot(lambda x:1/(1+np.exp(-(-2.3+slope.get_value()*x))),x_range=[0,10],color=TEAL))
        cut=DashedLine(axes.c2p(0,.5),axes.c2p(10,.5),color=ORANGE)
        self.play(FadeIn(title),Create(axes),Create(cut),Create(curve))
        note=Text('P = sigmoid(intercept + slope × x)',font_size=21).next_to(axes,DOWN)
        self.play(FadeIn(note));self.play(slope.animate.set_value(1.1),run_time=4);self.wait()


class RegularizationTeaching(Scene):
    def construct(self):
        title=Text('Ridge shrinkage vs lasso thresholding',font_size=31).to_edge(UP)
        subtitle=Text('Orthonormal predictors: synthetic coefficient magnitudes',font_size=18).next_to(title,DOWN)
        self.play(FadeIn(title),FadeIn(subtitle))
        lam=ValueTracker(0)
        base=[3.0,1.8,.7]
        lab=VGroup(*[Text(f'β{i+1}',font_size=21) for i in range(3)]).arrange(DOWN,buff=.86).to_edge(LEFT).shift(RIGHT*.8)
        self.play(FadeIn(lab))
        bars=VGroup()
        for i,v in enumerate(base):
            origin=lab[i].get_right()+RIGHT*.45
            ridge=always_redraw(lambda v=v,o=origin:Rectangle(width=max(.01,v/(1+lam.get_value())*1.05),height=.17,fill_color=BLUE,fill_opacity=1,stroke_width=0).move_to(o+RIGHT*max(.01,v/(1+lam.get_value())*1.05)/2))
            lasso=always_redraw(lambda v=v,o=origin:Rectangle(width=max(.01,(v-lam.get_value()))*1.05,height=.17,fill_color=ORANGE,fill_opacity=1,stroke_width=0).move_to(o+DOWN*.3+RIGHT*max(.01,(v-lam.get_value()))*1.05/2))
            bars.add(ridge,lasso)
        self.add(bars)
        note=Text('Blue = ridge   ·   Orange = lasso',font_size=23).to_edge(DOWN)
        self.play(FadeIn(note));self.play(lam.animate.set_value(2),run_time=5);self.wait()
