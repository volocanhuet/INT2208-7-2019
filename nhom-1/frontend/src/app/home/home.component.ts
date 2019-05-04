﻿import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '@app/_models';
import { UserService } from '@app/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Post } from '@app/_models/post.model';
import { Comment } from '@app/_models/comment.model';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit, OnDestroy {

    currentUser: User;
    currentUserSubscription: Subscription;
    posts: Post[] = [];
    progressShow: boolean = false;

    constructor(
        private userService: UserService,
        private http: HttpClient,
    ) {
        this.currentUserSubscription = this.userService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
    }

    sortPosts() {
        this.posts = this.posts.sort((a,b)=>{
            if (a.lastInteract < b.lastInteract) return 1;
            if (a.lastInteract > b.lastInteract) return -1;
            return 0;
        });
    }

    ngOnInit() {
        this.userService.get(this.currentUser.username).subscribe(data=>{
            this.currentUser = data.user;
        });

        this.http.get<any>(`${environment.apiUrl}/api/getfullpost`).subscribe((res)=>{
            if (res.state) {
                for (let i = 0; i < res.posts.length; i++) {
                    this.posts.push(new Post(res.posts[i]));
                }
                this.sortPosts();
            }
        });
    }

    ngOnDestroy() {
        this.currentUserSubscription.unsubscribe();
    }

    uploadPost(postElement,shareElement) {
        if (postElement.value == '') return;
        console.log(postElement.value);
        postElement.disabled = true;
        shareElement.disabled = true;
        this.progressShow = true;
        this.http.post<any>(`${environment.apiUrl}/api/post-thread`, {content: postElement.value}).subscribe((res)=>{
            if (res.state) {
                if (res.post) {
                    console.log(res.post);
                    postElement.disabled = false;
                    shareElement.disabled = false;
                    postElement.value = '';
                    this.progressShow = false;
                    this.loadPostFromRes(res.post);
                }
            }
        });
    }

    loadPostFromRes(resPost) {
        let post = new Post(resPost);
        this.posts.push(post);
        this.sortPosts();
    }
}
